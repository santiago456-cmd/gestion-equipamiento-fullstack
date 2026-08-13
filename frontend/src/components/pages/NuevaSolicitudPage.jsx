// components/pages/NuevaSolicitudPage.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import AppShell from "../layout/AppShell";
import FormField from "../ui/FormField";
import Button from "../ui/Button";
import { equipoApi } from "../../api/equipoApi";
import { solicitudApi } from "../../api/solicitudApi";
import { nuevaSolicitudSchema } from "../../schemas/solicitudSchemas";
import styles from "./NuevaSolicitudPage.module.css";

const CATEGORY_ICONS = {
  "Hardware Computacional": "laptop_mac",
  "Cómputo Portátil": "tablet_mac",
  "Periférico Visual": "monitor",
  "Periférico Entrada": "keyboard",
  "Imagen y Video": "photo_camera",
  Presentaciones: "tv",
};

const MAX_MOTIVO = 500;
const STEPS = ["Equipo", "Período", "Justificación"];

/**
 * NuevaSolicitudPage — create new equipment request (3-section form).
 * Conectado a GET /api/equipos (disponibles) y POST /api/solicitudes.
 */
export default function NuevaSolicitudPage() {
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [isLoadingEquipos, setIsLoadingEquipos] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [conflictosEnCola, setConflictosEnCola] = useState([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(nuevaSolicitudSchema),
    defaultValues: {
      equipoId: "",
      fechaRetiro: "",
      fechaDevolucion: "",
      motivo: "",
    },
  });

  const equipoId = watch("equipoId");
  const fechaRetiro = watch("fechaRetiro");
  const fechaDevolucion = watch("fechaDevolucion");
  const motivo = watch("motivo") ?? "";

  useEffect(() => {
    async function loadEquipos() {
      setIsLoadingEquipos(true);
      setLoadError("");
      try {
        const equiposDesdeApi = await equipoApi.listar();
        setEquipos(equiposDesdeApi ?? []);
      } catch (err) {
        setLoadError(err.message ?? "No se pudieron cargar los equipos.");
      } finally {
        setIsLoadingEquipos(false);
      }
    }
    loadEquipos();
  }, []);

  // Mecanismo de advertencia: monitorea cambios en equipoId, fechaRetiro, fechaDevolucion
  useEffect(() => {
    async function checkPendingConflicts() {
      if (!equipoId || !fechaRetiro || !fechaDevolucion) {
        setConflictosEnCola([]);
        return;
      }

      setIsCheckingConflicts(true);
      try {
        const res = await solicitudApi.listarPaginado({
          equipoId,
          estado: "pendiente",
          desde: fechaRetiro,
          hasta: fechaDevolucion,
          limit: 100, // Obtener todos los posibles conflictos
        });
        setConflictosEnCola(res.data ?? []);
      } catch (err) {
        // Ignorar errores silenciosamente para no interrumpir UX
        setConflictosEnCola([]);
      } finally {
        setIsCheckingConflicts(false);
      }
    }

    checkPendingConflicts();
  }, [equipoId, fechaRetiro, fechaDevolucion]);

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      await solicitudApi.crear({
        equipoId: Number(values.equipoId),
        fechaRetiro: values.fechaRetiro,
        fechaDevolucion: values.fechaDevolucion,
        motivo: values.motivo,
      });
      navigate("/solicitudes");
    } catch (err) {
      setSubmitError(err.message ?? "No se pudo crear la solicitud.");
    }
  };

  // Determine completed steps for stepper display
  const completedStep = equipoId
    ? fechaRetiro && fechaDevolucion
      ? motivo.length >= 10
        ? 3
        : 2
      : 1
    : 0;

  return (
    <AppShell>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Nueva Solicitud de Equipo</h1>
        <p className={styles.pageSubtitle}>
          Completa el formulario para solicitar un equipo del inventario
          corporativo.
        </p>
      </div>

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = completedStep >= stepNum;
          const isActive = completedStep === stepNum - 1;
          return (
            <div key={label} className={styles.step}>
              <span
                className={`${styles.stepNumber} ${isDone ? styles.stepNumberDone : isActive ? styles.stepNumberActive : ""}`}
              >
                {isDone ? (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 14 }}
                  >
                    check
                  </span>
                ) : (
                  stepNum
                )}
              </span>
              <span
                className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ""}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form card */}
      <div className={styles.formCard}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Step 1 — Equipment */}
          <div className={styles.stepSection}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepTitleNumber}>1</span>
              Selección de Equipo
            </h2>

            {loadError && (
              <p
                style={{
                  color: "var(--color-error)",
                  fontSize: "var(--font-size-body-sm)",
                  marginBottom: "var(--space-md)",
                }}
              >
                {loadError}
              </p>
            )}
            {errors.equipoId && (
              <p
                style={{
                  color: "var(--color-error)",
                  fontSize: "var(--font-size-body-sm)",
                  marginBottom: "var(--space-md)",
                }}
              >
                {errors.equipoId.message}
              </p>
            )}

            {isLoadingEquipos ? (
              <p
                style={{
                  color: "var(--color-secondary)",
                  fontSize: "var(--font-size-body-sm)",
                }}
              >
                Cargando equipos disponibles...
              </p>
            ) : equipos.length === 0 ? (
              <p
                style={{
                  color: "var(--color-secondary)",
                  fontSize: "var(--font-size-body-sm)",
                }}
              >
                No hay equipos disponibles en este momento.
              </p>
            ) : (
              <div className={styles.equipmentGrid}>
                {equipos.map((item) => {
                  const selected = String(equipoId) === String(item.id);
                  const icon =
                    CATEGORY_ICONS[item.categoria] ?? "devices_other";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.equipmentCard} ${selected ? styles.equipmentCardSelected : ""}`}
                      onClick={() =>
                        setValue("equipoId", String(item.id), {
                          shouldValidate: true,
                        })
                      }
                    >
                      <div
                        className={`${styles.equipmentCardIcon} ${selected ? styles.equipmentCardIconSelected : ""}`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 24 }}
                        >
                          {icon}
                        </span>
                      </div>
                      <p className={styles.equipmentCardName}>{item.nombre}</p>
                      <p className={styles.equipmentCardSub}>
                        {item.categoria}
                      </p>
                      <span className={styles.availablePill}>
                        {item.codigoInventario}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <hr className={styles.sectionDivider} />

          {/* Step 2 — Period */}
          <div className={styles.stepSection}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepTitleNumber}>2</span>
              Período de Uso
            </h2>

            <div className={styles.datesGrid}>
              <FormField
                label="Fecha de Retiro"
                type="date"
                icon="calendar_today"
                error={errors.fechaRetiro?.message}
                {...register("fechaRetiro")}
              />
              <FormField
                label="Fecha de Devolución Estimada"
                type="date"
                icon="event_upcoming"
                error={errors.fechaDevolucion?.message}
                {...register("fechaDevolucion")}
              />
            </div>

            {/* Advertencia por solicitudes pendientes en cola */}
            {conflictosEnCola.length > 0 && (
              <div
                style={{
                  padding: "var(--space-md)",
                  marginBottom: "var(--space-md)",
                  backgroundColor: "#fffbf0",
                  border: "1px solid #ffc107",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--font-size-body-sm)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-md)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, color: "#ffc107", flexShrink: 0 }}
                  >
                    warning
                  </span>
                  <div>
                    <p
                      style={{
                        fontWeight: "600",
                        marginBottom: "var(--space-xs)",
                        color: "#856404",
                      }}
                    >
                      Advertencia: Otros estudiantes en cola
                    </p>
                    <p style={{ color: "#856404", lineHeight: 1.5 }}>
                      Existen {conflictosEnCola.length} solicitud(es)
                      pendiente(s) de otros estudiantes para el mismo equipo en
                      el período seleccionado. El Encargado de Pañol decidirá
                      quién obtiene el aval. Puedes continuar enviando tu
                      solicitud.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.infoBanner}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, flexShrink: 0 }}
              >
                info
              </span>
              La fecha de devolución debe ser posterior a la fecha de retiro. El
              sistema validará que el equipo no tenga reservas aprobadas en ese
              período.
            </div>
          </div>

          <hr className={styles.sectionDivider} />

          {/* Step 3 — Justification */}
          <div className={styles.stepSection}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepTitleNumber}>3</span>
              Justificación
            </h2>

            <FormField
              label="Motivo de la Solicitud"
              type="textarea"
              rows={4}
              placeholder="Ej. Requerido para presentación en evento fuera de oficina..."
              error={errors.motivo?.message}
              required
              {...register("motivo")}
            />
            <div className={styles.textareaFooter}>
              <p
                style={{
                  fontSize: "var(--font-size-body-sm)",
                  color: "var(--color-secondary)",
                }}
              >
                Mínimo 10 caracteres requeridos.
              </p>
              <span
                className={`${styles.charCount} ${motivo.length > MAX_MOTIVO * 0.9 ? styles.charCountWarn : ""}`}
              >
                {motivo.length} / {MAX_MOTIVO}
              </span>
            </div>
          </div>

          {submitError && (
            <p
              style={{
                color: "var(--color-error)",
                fontSize: "var(--font-size-body-sm)",
                padding: "0 var(--space-lg)",
              }}
            >
              {submitError}
            </p>
          )}

          {/* Actions */}
          <div className={styles.formActions}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/solicitudes")}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon="send"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
