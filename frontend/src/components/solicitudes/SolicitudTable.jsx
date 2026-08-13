// components/solicitudes/SolicitudTable.jsx
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import Avatar from '../ui/Avatar';
import Pagination from '../ui/Pagination';
import styles from './SolicitudTable.module.css';

function formatFecha(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Determina si una solicitud aprobada está vencida (fechaDevolucion < hoy)
function getEstadoVisual(row) {
  if (row.estado === 'aprobada') {
    const hoy = new Date().toISOString().split('T')[0];
    if (row.fechaDevolucion < hoy) return 'vencido';
  }
  return row.estado;
}

/**
 * SolicitudTable — tabla de listado de solicitudes con paginación.
 * Maneja explícitamente los estados de carga, error y vacío.
 *
 * Props:
 *   rows         {Array}   — solicitudes de la página actual
 *   isLoading    {boolean}
 *   error        {string}
 *   currentPage  {number}
 *   totalPages   {number}
 *   totalResults {number}
 *   pageSize     {number}
 *   onPageChange {Function(page)}
 */
export default function SolicitudTable({
  rows,
  isLoading,
  error,
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.th}>ID Solicitud</th>
              <th className={styles.th}>Equipo</th>
              <th className={styles.th}>Usuario</th>
              <th className={styles.th}>Fecha Retiro</th>
              <th className={styles.th}>Fecha Devolución</th>
              <th className={`${styles.th} ${styles.thCenter}`}>Estado</th>
              <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Estado de carga */}
            {isLoading && (
              <tr>
                <td className={styles.td} colSpan={7}>Cargando solicitudes...</td>
              </tr>
            )}

            {/* Estado de error */}
            {!isLoading && error && (
              <tr>
                <td className={styles.td} colSpan={7} style={{ color: 'var(--color-error)' }}>
                  {error}
                </td>
              </tr>
            )}

            {/* Estado vacío */}
            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td className={styles.td} colSpan={7}>No se encontraron solicitudes para los filtros aplicados.</td>
              </tr>
            )}

            {/* Estado de éxito con datos */}
            {!isLoading && !error && rows.map((row) => (
              <tr key={row.id} className={styles.tr}>
                <td className={`${styles.td} ${styles.tdId}`}>#{row.id}</td>
                <td className={styles.td}>{row.equipo?.nombre ?? '—'}</td>
                <td className={styles.td}>
                  <div className={styles.userCell}>
                    <Avatar name={row.solicitante?.nombre ?? ''} size="sm" />
                    {row.solicitante?.nombre ?? '—'}
                  </div>
                </td>
                <td className={`${styles.td} ${styles.tdMuted}`}>{formatFecha(row.fechaRetiro)}</td>
                <td className={`${styles.td} ${styles.tdMuted}`}>{formatFecha(row.fechaDevolucion)}</td>
                <td className={`${styles.td} ${styles.tdCenter}`}>
                  <StatusBadge status={getEstadoVisual(row)} variant="table" showIcon={false} />
                </td>
                <td className={`${styles.td} ${styles.tdRight}`}>
                  <button className={styles.actionLink} onClick={() => navigate(`/solicitudes/${row.id}`)}>
                    Ver
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      arrow_forward
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && !error && totalResults > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
