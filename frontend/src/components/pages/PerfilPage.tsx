// src/components/pages/PerfilPage.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import AppShell from '../layout/AppShell';
import Card from '../ui/Card';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { usuarioApi } from '../../api/usuarioApi';
import {
  actualizarPerfilSchema,
  solicitarCambioEmailSchema,
  cambiarContrasenaSchema,
} from '../../schemas/usuarioSchemas';
import { getErrorMessage } from '../../utils/errors';
import styles from './PerfilPage.module.css';

type ActualizarPerfilValues = z.infer<typeof actualizarPerfilSchema>;
type SolicitarCambioEmailValues = z.infer<typeof solicitarCambioEmailSchema>;
type CambiarContrasenaValues = z.infer<typeof cambiarContrasenaSchema>;

/**
 * PerfilPage — gestión de la cuenta del usuario: nombre, email, contraseña.
 * Conectada a PATCH /api/usuarios/me, POST /api/usuarios/me/email,
 * POST /api/usuarios/me/password.
 */
export default function PerfilPage() {
  const { usuario, actualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mi Perfil</h1>
        <p className={styles.pageSubtitle}>Gestioná tus datos personales y tu acceso a la cuenta.</p>
      </div>

      <div className={styles.grid}>
        <DatosPersonalesCard
          nombreActual={usuario?.nombre ?? ''}
          emailActual={usuario?.email ?? ''}
          onNombreActualizado={actualizarUsuario}
        />
        <CambiarEmailCard />
        <CambiarContrasenaCard
          onContrasenaActualizada={async () => {
            await logout();
            navigate('/login', { replace: true });
          }}
        />
      </div>
    </AppShell>
  );
}

// --- Datos personales (nombre) ---

function DatosPersonalesCard({
  nombreActual,
  emailActual,
  onNombreActualizado,
}: {
  nombreActual: string;
  emailActual: string;
  onNombreActualizado: (usuario: import('../../types/auth').UsuarioAutenticado) => void;
}) {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ActualizarPerfilValues>({
    resolver: zodResolver(actualizarPerfilSchema),
    defaultValues: { nombre: nombreActual },
  });

  const onSubmit = async (values: ActualizarPerfilValues) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const data = await usuarioApi.actualizarPerfil(values.nombre);
      onNombreActualizado(data.data);
      setSuccessMessage(data.message ?? 'Perfil actualizado exitosamente.');
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'No se pudo actualizar el perfil.'));
    }
  };

  return (
    <Card title="Datos Personales" icon="person">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Nombre Completo"
          icon="badge"
          error={errors.nombre?.message}
          required
          {...register('nombre')}
        />
        <FormField label="Correo Electrónico" value={emailActual} icon="mail" disabled readOnly />

        {errorMessage && (
          <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-body-sm)' }}>{errorMessage}</p>
        )}
        {successMessage && (
          <p style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-body-sm)' }}>{successMessage}</p>
        )}

        <div className={styles.cardActions}>
          <Button type="submit" variant="primary" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// --- Cambiar email ---

function CambiarEmailCard() {
  const [mensaje, setMensaje] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolicitarCambioEmailValues>({
    resolver: zodResolver(solicitarCambioEmailSchema),
    defaultValues: { nuevoEmail: '' },
  });

  const onSubmit = async (values: SolicitarCambioEmailValues) => {
    setErrorMessage('');
    setMensaje('');
    try {
      const data = await usuarioApi.solicitarCambioEmail(values.nuevoEmail);
      setMensaje(
        data.mensaje ??
          data.message ??
          'Revisá tu nuevo correo electrónico para confirmar el cambio. El enlace es válido por 2 horas.',
      );
      reset();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'No se pudo solicitar el cambio de email.'));
    }
  };

  return (
    <Card title="Cambiar Correo Electrónico" icon="alternate_email">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Nuevo Correo Electrónico"
          type="email"
          icon="mail"
          placeholder="nuevo@empresa.com"
          error={errors.nuevoEmail?.message}
          required
          {...register('nuevoEmail')}
        />

        {errorMessage && (
          <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-body-sm)' }}>{errorMessage}</p>
        )}
        {mensaje && (
          <p style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-body-sm)' }}>{mensaje}</p>
        )}

        <div className={styles.cardActions}>
          <Button type="submit" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Solicitar Cambio'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// --- Cambiar contraseña ---

function CambiarContrasenaCard({ onContrasenaActualizada }: { onContrasenaActualizada: () => void }) {
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CambiarContrasenaValues>({
    resolver: zodResolver(cambiarContrasenaSchema),
    defaultValues: { passwordActual: '', passwordNueva: '' },
  });

  const onSubmit = async (values: CambiarContrasenaValues) => {
    setErrorMessage('');
    try {
      await usuarioApi.cambiarContrasena(values.passwordActual, values.passwordNueva);
      // El backend invalida la sesión actual al cambiar la contraseña
      await onContrasenaActualizada();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'No se pudo cambiar la contraseña.'));
    }
  };

  return (
    <Card title="Cambiar Contraseña" icon="lock" variant="danger">
      <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-secondary)', marginBottom: 'var(--space-md)' }}>
        Al confirmar, tu sesión actual se cerrará y vas a tener que iniciar sesión de nuevo con la nueva contraseña.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Contraseña Actual"
          type="password"
          icon="lock"
          error={errors.passwordActual?.message}
          required
          {...register('passwordActual')}
        />
        <FormField
          label="Nueva Contraseña"
          type="password"
          icon="lock_reset"
          placeholder="Mínimo 8 caracteres"
          error={errors.passwordNueva?.message}
          required
          {...register('passwordNueva')}
        />

        {errorMessage && (
          <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-body-sm)' }}>{errorMessage}</p>
        )}

        <div className={styles.cardActions}>
          <Button type="submit" variant="danger" disabled={isSubmitting}>
            {isSubmitting ? 'Actualizando...' : 'Cambiar Contraseña'}
          </Button>
        </div>
      </form>
    </Card>
  );
}