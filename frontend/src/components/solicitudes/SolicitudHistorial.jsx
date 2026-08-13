// components/solicitudes/SolicitudHistorial.jsx
import Card from "../ui/Card";
import styles from "./SolicitudHistorial.module.css";

const ACCION_LABELS = {
  creacion: "CREACIÓN",
  edicion: "EDICIÓN",
  aprobacion: "APROBACIÓN",
  rechazo: "RECHAZO",
  cancelacion: "CANCELACIÓN",
  devolucion: "DEVOLUCIÓN",
};

function formatFechaHora(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formatea valores del historial - convierte JSON a texto legible
 */
function formatValor(valor) {
  if (!valor) return "—";

  try {
    const parsed = JSON.parse(valor);
    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed)
        .map(([key, val]) => {
          const keyFormateada = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
          return `${keyFormateada}: ${val}`;
        })
        .join(" • ");
    }
  } catch (e) {
    return valor;
  }

  return valor;
}

function getActionClass(action) {
  switch (action) {
    case "creacion":
      return styles.chipCreacion;
    case "aprobacion":
      return styles.chipSuccess;
    case "rechazo":
    case "cancelacion":
      return styles.chipDanger;
    case "devolucion":
      return styles.chipInfo;
    default:
      return styles.chipActualizacion;
  }
}

/**
 * SolicitudHistorial — historial de cambios de una solicitud.
 * Conectado a GET /api/solicitudes/:id/historial.
 *
 * Props:
 *   historial {Array} — filas devueltas por el endpoint de historial
 */
export default function SolicitudHistorial({ historial }) {
  return (
    <Card title="Historial de Cambios" icon="history" noPadding>
      {historial.length === 0 ? (
        <p
          style={{
            padding: "var(--space-lg)",
            color: "var(--color-secondary)",
            fontSize: "var(--font-size-body-sm)",
          }}
        >
          Sin movimientos registrados.
        </p>
      ) : (
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th className={styles.historyTh}>Fecha</th>
              <th className={styles.historyTh}>Usuario</th>
              <th className={styles.historyTh}>Acción</th>
              <th className={styles.historyTh}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((row) => (
              <tr key={row.id} className={styles.historyTr}>
                <td className={`${styles.historyTd} ${styles.historyTdMuted}`}>
                  {formatFechaHora(row.fechaHora)}
                </td>
                <td className={styles.historyTd}>
                  {row.usuario?.nombre ?? row.operador?.nombre ?? "—"}
                </td>
                <td className={styles.historyTd}>
                  <span
                    className={`${styles.chip} ${row.accion === "creacion" ? styles.chipCreacion : styles.chipActualizacion}`}
                  >
                    {ACCION_LABELS[row.accion] ?? row.accion?.toUpperCase()}
                  </span>
                </td>
                <td className={styles.historyTd}>
                  <div className={styles.historyDetail}>
                    {row.valorAnterior ? (
                      <div className={styles.historyDetailLine}>
                        <span className={styles.historyDetailLabel}>
                          Antes:
                        </span>
                        <span className={styles.historyDetailValue}>
                          {formatValor(row.valorAnterior)}
                        </span>
                      </div>
                    ) : null}
                    <div className={styles.historyDetailLine}>
                      <span className={styles.historyDetailLabel}>
                        {row.valorAnterior ? "Ahora:" : "Detalle:"}
                      </span>
                      <span className={styles.historyDetailValue}>
                        {formatValor(row.valorNuevo)}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
