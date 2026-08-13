// components/solicitudes/SolicitudAcciones.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { rechazoSchema } from '../../schemas/solicitudSchemas';
import styles from './SolicitudAcciones.module.css';

/**
 * SolicitudAcciones — barra de acciones visibles según el rol del usuario
 * y el estado actual de la solicitud, más el modal de confirmación de rechazo.
 *
 * Reglas (alineadas a las reglas de negocio/autorización del backend):
 *   - Editar / Cancelar: dueño de la solicitud, mientras esté en estado habilitado.
 *   - Aprobar / Rechazar: solo admin, y solo si está 'pendiente'.
 *   - Registrar devolución: admin o dueño, si está 'aprobada'.
 *
 * Props:
 *   id            {string|number} — id de la solicitud (para navegación a edición)
 *   solicitud     {object}         — solicitud actual
 *   isAdmin       {boolean}
 *   isOwner       {boolean}
 *   onAprobar     {Function}       — POST/PATCH aprobar
 *   onRechazar    {Function}       — PATCH rechazar
 *   onCancelar    {Function}       — PATCH cancelar
 *   onDevolver    {Function}       — PATCH devolver
 */
export default function SolicitudAcciones({
  id,
  solicitud,
  isAdmin,
  isOwner,
  onAprobar,
  onRechazar,
  onCancelar,
  onDevolver,
}) {
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(rechazoSchema),
    defaultValues: { rejectMotivo: '' },
  });

  const canEdit = isOwner && solicitud.estado === 'pendiente';
  const canCancel = isOwner && ['pendiente', 'aprobada'].includes(solicitud.estado);
  const canApproveReject = isAdmin && solicitud.estado === 'pendiente';
  const canDevolver = solicitud.estado === 'aprobada' && (isAdmin || isOwner);

  const showActionBar = canEdit || canCancel || canApproveReject || canDevolver;

  const submitReject = handleSubmit(async () => {
    await onRechazar();
    setShowRejectModal(false);
    reset();
  });

  if (!showActionBar) return null;

  return (
    <>
      {/* Sticky action bar */}
      <div className={styles.actionBar}>
        <p className={styles.actionBarNote}>
          {isAdmin ? 'Revisando solicitud como administrador.' : 'Acciones disponibles para tu solicitud.'}
        </p>
        <div className={styles.actionBarButtons}>
          {canEdit && (
            <Button variant="secondary" icon="edit" onClick={() => navigate(`/solicitudes/${id}/editar`)}>
              Editar
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" icon="block" onClick={onCancelar}>
              Cancelar Solicitud
            </Button>
          )}
          {canDevolver && (
            <Button variant="neutral" icon="replay" onClick={onDevolver}>
              Registrar Devolución
            </Button>
          )}
          {canApproveReject && (
            <Button variant="danger" icon="close" onClick={() => setShowRejectModal(true)}>
              Rechazar
            </Button>
          )}
          {canApproveReject && (
            <Button variant="primary" icon="check" onClick={onAprobar}>
              Aprobar
            </Button>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Rechazar Solicitud</h2>
            <FormField
              label="Motivo del rechazo"
              type="textarea"
              rows={4}
              placeholder="Describe el motivo del rechazo..."
              error={errors.rejectMotivo?.message}
              required
              {...register('rejectMotivo')}
            />
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={submitReject} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Confirmar Rechazo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
