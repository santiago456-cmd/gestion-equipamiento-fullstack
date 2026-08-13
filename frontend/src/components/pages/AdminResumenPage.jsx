// components/pages/AdminResumenPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import Avatar from '../ui/Avatar';
import { solicitudApi } from '../../api/solicitudApi';
import styles from './AdminResumenPage.module.css';

function formatFecha(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const KPI_CONFIG = [
  { key: 'pendientes', label: 'Solicitudes Pendientes', icon: 'pending_actions', tone: 'warning' },
  { key: 'aprobadas', label: 'Aprobadas (activas)', icon: 'check_circle', tone: 'success' },
  { key: 'vencidas', label: 'Vencidas', icon: 'warning', tone: 'danger' },
  { key: 'equiposDisponibles', label: 'Equipos Disponibles', icon: 'inventory_2', tone: 'info' },
];

/**
 * AdminResumenPage — admin dashboard with KPIs and recent activity.
 * Conectado a GET /api/solicitudes/dashboard/resumen (solo admin).
 */
export default function AdminResumenPage() {
  const [resumen, setResumen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const res = await solicitudApi.obtenerResumen();
        setResumen(res.data);
      } catch (err) {
        setError(err.message ?? 'No se pudo cargar el resumen.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppShell>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Resumen Administrativo</h1>
        <p className={styles.pageSubtitle}>
          Vista general del estado de las solicitudes y el inventario de equipos.
        </p>
      </div>

      {error && (
        <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-md)' }}>{error}</p>
      )}

      {isLoading ? (
        <p style={{ color: 'var(--color-secondary)' }}>Cargando resumen...</p>
      ) : resumen ? (
        <>
          {/* KPI grid */}
          <div className={styles.kpiGrid}>
            {KPI_CONFIG.map((kpi) => (
              <div key={kpi.key} className={styles.kpiCard}>
                <div className={`${styles.kpiIcon} ${styles[`kpiIcon_${kpi.tone}`]}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                    {kpi.icon}
                  </span>
                </div>
                <div>
                  <p className={styles.kpiValue}>{resumen[kpi.key] ?? 0}</p>
                  <p className={styles.kpiLabel}>{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bento layout: distribution + recent requests */}
          <div className={styles.bentoGrid}>
            {/* Distribución por categoría */}
            <Card title="Equipos por Categoría" icon="category" className={styles.bentoSpan1}>
              {resumen.equiposPorCategoria?.length ? (
                <div className={styles.categoryList}>
                  {resumen.equiposPorCategoria.map((cat) => (
                    <div key={cat.categoria} className={styles.categoryRow}>
                      <span className={styles.categoryName}>{cat.categoria}</span>
                      <span className={styles.categoryCount}>{cat.total}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-size-body-sm)' }}>
                  Sin datos de categorías.
                </p>
              )}
            </Card>

            {/* Solicitudes recientes */}
            <Card title="Solicitudes Recientes" icon="schedule" noPadding className={styles.bentoSpan2}>
              {resumen.solicitudesRecientes?.length ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>ID</th>
                        <th className={styles.th}>Equipo</th>
                        <th className={styles.th}>Usuario</th>
                        <th className={styles.th}>Fecha</th>
                        <th className={`${styles.th} ${styles.thCenter}`}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.solicitudesRecientes.map((row) => (
                        <tr key={row.id} className={styles.tr}>
                          <td className={styles.td}>
                            <Link to={`/solicitudes/${row.id}`} className={styles.idLink}>
                              #{row.id}
                            </Link>
                          </td>
                          <td className={styles.td}>{row.equipo?.nombre ?? '—'}</td>
                          <td className={styles.td}>
                            <div className={styles.userCell}>
                              <Avatar name={row.solicitante?.nombre ?? ''} size="sm" />
                              {row.solicitante?.nombre ?? '—'}
                            </div>
                          </td>
                          <td className={`${styles.td} ${styles.tdMuted}`}>{formatFecha(row.fechaRetiro)}</td>
                          <td className={`${styles.td} ${styles.tdCenter}`}>
                            <StatusBadge status={row.estado} variant="table" showIcon={false} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ padding: 'var(--space-lg)', color: 'var(--color-secondary)', fontSize: 'var(--font-size-body-sm)' }}>
                  Sin actividad reciente.
                </p>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
