// components/ui/StatusBadge.jsx
import styles from './StatusBadge.module.css';

// Mapeo alineado a los estados reales del modelo Solicitud del backend:
// 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada' | 'devuelta'
// + estado calculado 'vencido' para solicitudes aprobadas con fechaDevolucion pasada.
const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', icon: 'pending', className: styles.pendiente },
  aprobada: { label: 'Aprobada', icon: 'check_circle', className: styles.aprobado },
  rechazada: { label: 'Rechazada', icon: 'cancel', className: styles.rechazado },
  cancelada: { label: 'Cancelada', icon: 'block', className: styles.rechazado },
  devuelta: { label: 'Devuelta', icon: 'replay', className: styles.devuelto },
  vencido: { label: 'Vencido', icon: 'warning', className: styles.vencido },
};

/**
 * StatusBadge — pill-shaped semantic status indicator.
 *
 * Props:
 *   status    {'pendiente'|'aprobada'|'rechazada'|'cancelada'|'devuelta'|'vencido'}
 *   variant   {'default'|'table'}  — table variant is more compact with no pill radius
 *   showIcon  {boolean}
 */
export default function StatusBadge({ status, variant = 'default', showIcon = true }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendiente;

  return (
    <span
      className={[
        styles.badge,
        config.className,
        variant === 'table' ? styles.tableVariant : '',
      ].join(' ')}
    >
      {showIcon && (
        <span className={`material-symbols-outlined ${styles.icon}`}>
          {config.icon}
        </span>
      )}
      {config.label}
    </span>
  );
}
