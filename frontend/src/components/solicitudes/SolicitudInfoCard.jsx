// components/solicitudes/SolicitudInfoCard.jsx
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import styles from './SolicitudInfoCard.module.css';

const CATEGORY_ICONS = {
  'Hardware Computacional': 'laptop_mac',
  'Cómputo Portátil': 'tablet_mac',
  'Periférico Visual': 'monitor',
  'Periférico Entrada': 'keyboard',
  'Imagen y Video': 'photo_camera',
  Presentaciones: 'tv',
};

function formatFecha(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * SolicitudInfoCard — datos generales de una solicitud (solicitante, equipo, fechas, motivo).
 *
 * Props:
 *   solicitud {object} — objeto solicitud devuelto por GET /api/solicitudes/:id
 */
export default function SolicitudInfoCard({ solicitud }) {
  const equipoIcon = CATEGORY_ICONS[solicitud.equipo?.categoria] ?? 'devices_other';

  return (
    <Card title="Información General" icon="info">
      <div className={styles.infoGrid}>
        <div>
          <p className={styles.infoLabel}>Solicitante</p>
          <div className={styles.userValue}>
            <Avatar name={solicitud.solicitante?.nombre ?? ''} size="md" />
            <div>
              <p className={styles.infoValue} style={{ marginBottom: 0 }}>
                {solicitud.solicitante?.nombre}
              </p>
              <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-secondary)' }}>
                {solicitud.solicitante?.email}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className={styles.infoLabel}>Equipo Requerido</p>
          <p className={styles.infoValue}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-secondary)' }}>
              {equipoIcon}
            </span>
            {solicitud.equipo?.nombre} ({solicitud.equipo?.codigoInventario})
          </p>
        </div>

        <div>
          <p className={styles.infoLabel}>Fecha de Retiro</p>
          <p className={styles.infoValue}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-secondary)' }}>calendar_today</span>
            {formatFecha(solicitud.fechaRetiro)}
          </p>
        </div>

        <div>
          <p className={styles.infoLabel}>Fecha de Devolución</p>
          <p className={styles.infoValue}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-secondary)' }}>event_available</span>
            {formatFecha(solicitud.fechaDevolucion)}
          </p>
        </div>

        {solicitud.autorizador && (
          <div>
            <p className={styles.infoLabel}>Autorizado por</p>
            <p className={styles.infoValue}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-secondary)' }}>verified_user</span>
              {solicitud.autorizador.nombre} ({solicitud.autorizador.rol})
            </p>
          </div>
        )}

        <div className={styles.infoGridFull}>
          <p className={styles.infoLabel}>Motivo de la Solicitud</p>
          <p style={{ fontSize: 'var(--font-size-body-base)', color: 'var(--color-on-surface)', lineHeight: 'var(--line-height-body-base)' }}>
            {solicitud.motivo}
          </p>
        </div>
      </div>
    </Card>
  );
}
