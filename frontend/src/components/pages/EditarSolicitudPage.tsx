// components/pages/EditarSolicitudPage.tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { z } from 'zod';
import AppShell from '../layout/AppShell';
import StatusBadge from '../ui/StatusBadge';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import { solicitudApi } from '../../api/solicitudApi';
import { editarSolicitudSchema } from '../../schemas/solicitudSchemas';
import type { Solicitud } from '../../types/solicitud';
import { getErrorMessage } from '../../utils/errors';
import styles from './EditarSolicitudPage.module.css';

const CATEGORY_ICONS: Record<string, string> = {
  'Hardware Computacional': 'laptop_mac',
  'Cómputo Portátil': 'tablet_mac',
  'Periférico Visual': 'monitor',
  'Periférico Entrada': 'keyboard',
  'Imagen y Video': 'photo_camera',
  Presentaciones: 'tv',
};

type EditarSolicitudFormValues = z.infer<typeof editarSolicitudSchema>;

/**
 * EditarSolicitudPage — editable form for an existing solicitud.
 * Conectado a GET /api/solicitudes/:id y PUT /api/solicitudes/:id.
 * Solo permite editar solicitudes en estado 'pendiente' (regla de negocio del backend).
 */
export default function EditarSolicitudPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [conflictosEnCola, setConflictosEnCola] = useState<Solicitud[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditarSolicitudFormValues>({
    resolver: zodResolver(editarSolicitudSchema),
    defaultValues: { fechaRetiro: '', fechaDevolucion: '', motivo: '' },
  });

  const fechaRetiro = watch('fechaRetiro');
  const fechaDevolucion = watch('fechaDevolucion');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      setLoadError('');
      try {
        const res = await solicitudApi.obtenerDetalle(id);
        setSolicitud(res.data);
        reset({
          fechaRetiro: res.data.fechaRetiro,
          fechaDevolucion: res.data.fechaDevolucion,
          motivo: res.data.motivo,
        });
      } catch (err) {
        setLoadError(getErrorMessage(err, 'No se pudo cargar la solicitud.'));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, reset]);

  // Mecanismo de advertencia: monitorea cambios en fechas
  useEffect(() => {
    async function checkPendingConflicts() {
      if (!solicitud || !fechaRetiro || !fechaDevolucion) {
        setConflictosEnCola([]);
        return;
      }

      setIsCheckingConflicts(true);
      try {
        const res = await solicitudApi.listarPaginado({
          equipoId: solicitud.equipoId,
          estado: 'pendiente',
          desde: fechaRetiro,
          hasta: fechaDevolucion,
          limit: 100,
        });
        const conflictosOtros = (res.data ?? []).filter(
          (s: Solicitud) => s.id !== solicitud.id,
        );
        setConflictosEnCola(conflictosOtros);
      } catch {
        setConflictosEnCola([]);
      } finally {
        setIsCheckingConflicts(false);
      }
    }

    checkPendingConflicts();
  }, [solicitud?.id, solicitud?.equipoId, fechaRetiro, fechaDevolucion]);

  const onSubmit = async (values: EditarSolicitudFormValues) => {
    if (!id) return;
    setSubmitError('');
    try {
      await solicitudApi.editar(id, values);
      navigate(`/solicitudes/${id}`);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'No se pudo actualizar la solicitud.'));
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <p style={{ color: 'var(--color-secondary)' }}>Cargando solicitud...</p>
      </AppShell>
    );
  }

  if (loadError || !solicitud) {
    return (
      <AppShell>
        <p style={{ color: 'var(--color-error)' }}>
          {loadError || 'Solicitud no encontrada.'}
        </p>
      </AppShell>
    );
  }

  const icon = CATEGORY_ICONS[solicitud.equipo?.categoria ?? ''] ?? 'devices_other';

  return (
    <AppShell>
      <Link to="/solicitudes" className={styles.backLink}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          arrow_back
        </span>
        Volver a la lista
      </Link>

      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>Editar Solicitud #{solicitud.id}</h1>
          <StatusBadge status={solicitud.estado} />
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.contextSection}>
          <div className={styles.contextIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
              {icon}
            </span>
          </div>
          <div>
            <h3 className={styles.contextTitle}>{solicitud.equipo?.nombre}</h3>
            <p className={styles.contextMeta}>
              Categoría: {solicitud.equipo?.categoria} • SKU: {solicitud.equipo?.codigoInventario}
            </p>
            <p className={styles.contextSolicitante}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                person
              </span>
              Solicitante: <strong>{solicitud.solicitante?.nombre}</strong>
              &nbsp;({solicitud.solicitante?.email})
            </p>
          </div>
        </div>

        {solicitud.estado !== 'pendiente' && (
          <div style={{ padding: 'var(--space-lg)' }}>
            <p style={{ color: 'var(--color-warning-text)', fontSize: 'var(--font-size-body-sm)' }}>
              Esta solicitud ya no está en estado pendiente, por lo que no puede ser editada.
            </p>
          </div>
        )}

        {solicitud.estado === 'pendiente' && (
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.datesGrid}>
              <FormField
                label="Fecha de Retiro Solicitada"
                type="date"
                icon="calendar_today"
                error={errors.fechaRetiro?.message}
                {...register('fechaRetiro')}
              />
              <FormField
                label="Fecha de Devolución Estimada"
                type="date"
                icon="event_upcoming"
                error={errors.fechaDevolucion?.message}
                {...register('fechaDevolucion')}
              />
            </div>

            {isCheckingConflicts && (
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-secondary)', marginTop: 'var(--space-md)' }}>
                Verificando disponibilidad del equipo...
              </p>
            )}

            {conflictosEnCola.length > 0 && (
              <div
                style={{
                  padding: 'var(--space-md)',
                  marginBottom: 'var(--space-md)',
                  marginTop: 'var(--space-md)',
                  backgroundColor: '#fffbf0',
                  border: '1px solid #ffc107',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-body-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#ffc107', flexShrink: 0 }}>
                    warning
                  </span>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 'var(--space-xs)', color: '#856404' }}>
                      Advertencia: Otros estudiantes en cola
                    </p>
                    <p style={{ color: '#856404', lineHeight: 1.5 }}>
                      Existen {conflictosEnCola.length} solicitud(es) pendiente(s) de otros estudiantes
                      para el mismo equipo en el período seleccionado. El Encargado decidirá quién obtiene
                      el aval. Puedes guardar los cambios a tu solicitud.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <FormField
              label="Motivo de la Solicitud"
              type="textarea"
              rows={4}
              placeholder="Ej. Equipo necesario para evento externo..."
              error={errors.motivo?.message}
              required
              {...register('motivo')}
            />

            {submitError && (
              <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-body-sm)' }}>
                {submitError}
              </p>
            )}

            <div className={styles.formActions}>
              <Button variant="secondary" type="button" onClick={() => navigate(`/solicitudes/${id}`)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" icon="save" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}