// components/solicitudes/SolicitudAcciones.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { rechazoSchema } from '../../schemas/solicitudSchemas';
import type { Solicitud } from '../../types/solicitud';
import styles from './SolicitudAcciones.module.css';

type RechazoFormValues = z.infer<typeof rechazoSchema>;

interface SolicitudAccionesProps {
  /** id de la solicitud (para navegación a edición) */
  id: string | number;
  solicitud: Solicitud;
  isAdmin: boolean;
  isEncargado: boolean;
  isOwner: boolean;
  /** POST/PATCH aprobar */
  onAprobar: () => void | Promise<void>;
  /** PATCH rechazar */
  onRechazar: () => void | Promise<void>;
  /** PATCH cancelar */
  onCancelar: () => void | Promise<void>;
  /** PATCH devolver */
  onDevolver: () => void | Promise<void>;
}

/**
 * SolicitudAcciones — barra de acciones visibles según el rol del usuario
 * y el estado actual de la solicitud, más el modal de confirmación de rechazo.
 *
 * Reglas (alineadas a las reglas de negocio/autorización del backend):
 *   - Editar / Cancelar: dueño de la solicitud, mientras esté en estado habilitado.
 *   - Aprobar: admin O encargado, y solo si está 'pendiente'.
 *   - Rechazar: solo admin, y solo si está 'pendiente'.
 *   - Registrar devolución: admin o dueño, si está 'aprobada'.
 */
export default function SolicitudAcciones({
  id,
  solicitud,
  isAdmin,
  isEncargado,
  isOwner,
  onAprobar,
  onRechazar,
  onCancelar,
  onDevolver,
}: SolicitudAccionesProps) {
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RechazoFormValues>({
    resolver: zodResolver(rechazoSchema),
    defaultValues: { rejectMotivo: '' },
  });

  const canEdit = isOwner && solicitud.estado === 'pendiente';
  const canCancel = isOwner && ['pendiente', 'aprobada'].includes(solicitud.estado);
  // Aprobar: admin o encargado. Rechazar: solo admin.
  const canApprove = (isAdmin || isEncargado) && solicitud.estado === 'pendiente';
  const canReject = isAdmin && solicitud.estado === 'pendiente';
  const canDevolver = solicitud.estado === 'aprobada' && (isAdmin || isOwner);

  const showActionBar = canEdit || canCancel || canApprove || canReject || canDevolver;

  const submitReject = handleSubmit(async () => {
    await onRechazar();
    setShowRejectModal(false);
    reset();
  });

  if (!showActionBar) return null;

  const nota = isAdmin
    ? 'Revisando solicitud como administrador.'
    : isEncargado
      ? 'Revisando solicitud como encargado.'
      : 'Acciones disponibles para tu solicitud.';

  return (
    <>
      {/* Sticky action bar */}
      <div className={styles.actionBar}>
        <p className={styles.actionBarNote}>{nota}</p>
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
          {canReject && (
            <Button variant="danger" icon="close" onClick={() => setShowRejectModal(true)}>
              Rechazar
            </Button>
          )}
          {canApprove && (
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