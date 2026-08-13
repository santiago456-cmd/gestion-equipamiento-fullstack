// components/pages/SolicitudDetailPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import StatusBadge from '../ui/StatusBadge';
import SolicitudInfoCard from '../solicitudes/SolicitudInfoCard';
import SolicitudHistorial from '../solicitudes/SolicitudHistorial';
import SolicitudAcciones from '../solicitudes/SolicitudAcciones';
import { useAuth } from '../../context/AuthContext';
import { solicitudApi } from '../../api/solicitudApi';
import styles from './SolicitudDetailPage.module.css';

/**
 * SolicitudDetailPage — vista de detalle de una solicitud (/solicitudes/:id).
 * Compone: SolicitudInfoCard (datos generales), SolicitudHistorial (historial de cambios)
 * y SolicitudAcciones (acciones visibles según rol/estado).
 * Conectado a GET /api/solicitudes/:id, GET /api/solicitudes/:id/historial
 * y a las acciones aprobar/rechazar/cancelar/devolver.
 */
export default function SolicitudDetailPage() {
  const { id } = useParams();
  const { usuario } = useAuth();

  const [solicitud, setSolicitud] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchAll = async () => {
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
      setLoadError(err.message ?? 'No se pudo cargar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const runAction = async (action) => {
    setActionError('');
    try {
      await action();
      await fetchAll();
    } catch (err) {
      setActionError(err.message ?? 'No se pudo completar la acción.');
    }
  };

  // Estado de carga
  if (isLoading) {
    return (
      <AppShell>
        <p style={{ color: 'var(--color-secondary)' }}>Cargando solicitud...</p>
      </AppShell>
    );
  }

  // Estado de error / recurso inexistente
  if (loadError || !solicitud) {
    return (
      <AppShell>
        <p style={{ color: 'var(--color-error)' }}>{loadError || 'Solicitud no encontrada.'}</p>
      </AppShell>
    );
  }

  const isAdmin = usuario?.rol === 'admin';
  const isOwner = solicitud.solicitante?.id === usuario?.id;

  return (
    <AppShell>
      {/* Back link */}
      <Link to="/solicitudes" className={styles.backLink}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        Volver a la lista
      </Link>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.solicitudTitle}>
            Detalle de Solicitud{' '}
            <span className={styles.solicitudId}>#{solicitud.id}</span>
          </h1>
          <StatusBadge status={solicitud.estado} />
        </div>
      </div>

      {actionError && (
        <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-md)' }}>{actionError}</p>
      )}

      {/* Two-column layout */}
      <div className={styles.layout}>
        {/* Main column */}
        <div className={styles.mainCol}>
          <SolicitudInfoCard solicitud={solicitud} />
          <SolicitudHistorial historial={historial} />
        </div>

        {/* Side column */}
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

      {/* Acciones según rol/estado */}
      <SolicitudAcciones
        id={id}
        solicitud={solicitud}
        isAdmin={isAdmin}
        isOwner={isOwner}
        onAprobar={() => runAction(() => solicitudApi.aprobar(id))}
        onRechazar={() => runAction(() => solicitudApi.rechazar(id))}
        onCancelar={() => runAction(() => solicitudApi.cancelar(id))}
        onDevolver={() => runAction(() => solicitudApi.devolver(id))}
      />
    </AppShell>
  );
}
