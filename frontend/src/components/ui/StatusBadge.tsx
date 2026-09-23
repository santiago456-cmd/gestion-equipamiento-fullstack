// components/ui/StatusBadge.tsx
import styles from './StatusBadge.module.css';

// Alineado a los estados reales del modelo Solicitud del backend:
// 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada' | 'devuelta'
// + estado calculado 'vencido' para solicitudes aprobadas con fechaDevolucion pasada.
export type SolicitudStatus =
  | 'pendiente'
  | 'aprobada'
  | 'rechazada'
  | 'cancelada'
  | 'devuelta'
  | 'vencido';

interface StatusConfigEntry {
  label: string;
  icon: string;
  className: string;
}

const STATUS_CONFIG: Record<SolicitudStatus, StatusConfigEntry> = {
  pendiente: { label: 'Pendiente', icon: 'pending', className: styles.pendiente },
  aprobada: { label: 'Aprobada', icon: 'check_circle', className: styles.aprobado },
  rechazada: { label: 'Rechazada', icon: 'cancel', className: styles.rechazado },
  cancelada: { label: 'Cancelada', icon: 'block', className: styles.rechazado },
  devuelta: { label: 'Devuelta', icon: 'replay', className: styles.devuelto },
  vencido: { label: 'Vencido', icon: 'warning', className: styles.vencido },
};

interface StatusBadgeProps {
  status: SolicitudStatus;
  /** Table variant is more compact with no pill radius */
  variant?: 'default' | 'table';
  showIcon?: boolean;
}

export default function StatusBadge({
  status,
  variant = 'default',
  showIcon = true,
}: StatusBadgeProps) {
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