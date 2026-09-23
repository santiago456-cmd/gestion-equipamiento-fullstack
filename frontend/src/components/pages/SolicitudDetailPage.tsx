// components/pages/SolicitudDetailPage.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import StatusBadge from '../ui/StatusBadge';
import SolicitudInfoCard from '../solicitudes/SolicitudInfoCard';
import SolicitudHistorial from '../solicitudes/SolicitudHistorial';
import SolicitudAcciones from '../solicitudes/SolicitudAcciones';
import { useAuth } from '../../context/AuthContext';
import { solicitudApi } from '../../api/solicitudApi';
import type { Solicitud, HistorialRow } from '../../types/solicitud';
import { getErrorMessage } from '../../utils/errors';
import styles from './SolicitudDetailPage.module.css';

/**
 * SolicitudDetailPage — vista de detalle de una solicitud (/solicitudes/:id).
 * Compone: SolicitudInfoCard, SolicitudHistorial y SolicitudAcciones.
 */
export default function SolicitudDetailPage() {
  const { id } = useParams();
  const { usuario } = useAuth();

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [historial, setHistorial] = useState<HistorialRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchAll = async () => {
    if (!id) return;
    setIsLoading(true);
    setLoadError('');
    try {
      const [detalleRes, historialRes] = await Promise.all([
        solicitudApi.obtenerDetalle(id),
        solicitudApi.obtenerHistorial(id),
      ]);
      setSolicitud(detalleRes.data);
      setHistorial(historialRes.data ?? []);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'No se pudo cargar la solicitud.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError('');
    try {
      await action();
      await fetchAll();
    } catch (err) {
      setActionError(getErrorMessage(err, 'No se pudo completar la acción.'));
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
        <p style={{ color: 'var(--color-error)' }}>{loadError || 'Solicitud no encontrada.'}</p>
      </AppShell>
    );
  }

  const isAdmin = usuario?.rol === 'admin';
  const isEncargado = usuario?.rol === 'encargado'
  const isOwner = solicitud.solicitante?.id === usuario?.id;

  return (
    <AppShell>
      <Link to="/solicitudes" className={styles.backLink}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        Volver a la lista
      </Link>

      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.solicitudTitle}>
            Detalle de Solicitud <span className={styles.solicitudId}>#{solicitud.id}</span>
          </h1>
          <StatusBadge status={solicitud.estado} />
        </div>
      </div>

      {actionError && (
        <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-md)' }}>{actionError}</p>
      )}

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <SolicitudInfoCard solicitud={solicitud} />
          <SolicitudHistorial historial={historial} />
        </div>

        <div className={styles.sideCol}>
          {solicitud.estado === 'pendiente' && (
            <div className={styles.slaAlert}>
              <p className={styles.slaTitle}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rule</span>
                Solicitud Pendiente
              </p>
              <p className={styles.slaText}>
                Esta solicitud está esperando la revisión de un administrador para ser aprobada o rechazada.
                {solicitud.equipo?.requiereAutorizacion && ' Este equipo requiere autorización especial.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {id && (
        <SolicitudAcciones
          id={id}
          solicitud={solicitud}
          isAdmin={isAdmin}
          isEncargado={isEncargado}
          isOwner={isOwner}
          onAprobar={() => runAction(() => solicitudApi.aprobar(id))}
          onRechazar={() => runAction(() => solicitudApi.rechazar(id))}
          onCancelar={() => runAction(() => solicitudApi.cancelar(id))}
          onDevolver={() => runAction(() => solicitudApi.devolver(id))}
        />
      )}
    </AppShell>
  );
}