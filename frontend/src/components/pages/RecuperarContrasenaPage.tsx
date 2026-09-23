// src/components/pages/RecuperarContrasenaPage.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import type { z } from 'zod';
import { recuperarContrasenaSchema } from '../../schemas/authSchemas';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import styles from './LoginPage.module.css';

type RecuperarFormValues = z.infer<typeof recuperarContrasenaSchema>;

/**
 * RecuperarContrasenaPage — solicita el envío del link de restablecimiento.
 * El backend siempre responde el mismo mensaje genérico, exista o no el email
 * (por seguridad), así que el frontend no distingue ningún caso especial.
 */
export default function RecuperarContrasenaPage() {
  const [mensaje, setMensaje] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarFormValues>({
    resolver: zodResolver(recuperarContrasenaSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: RecuperarFormValues) => {
    setErrorMessage('');
    setMensaje('');
    try {
      const data = await authApi.solicitarRecuperacion(values.email);
      setMensaje(
        data.mensaje ??
          data.message ??
          'Si el correo electrónico está registrado, vas a recibir un enlace para restablecer tu contraseña.',
      );
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'No se pudo procesar la solicitud.'));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.brandIconWrap}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}
            >
              lock_reset
            </span>
          </div>
          <h1 className={styles.brandTitle}>EquiManage Pro</h1>
          <p className={styles.brandSub}>Recuperar contraseña</p>
        </div>

        <div className={styles.card}>
          {mensaje ? (
            <p style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-body-base)' }}>
              {mensaje}
            </p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormField
                label="Correo Electrónico"
                type="email"
                icon="mail"
                placeholder="ejemplo@empresa.com"
                error={errors.email?.message}
                {...register('email')}
              />

              {errorMessage && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-body-sm)' }}>
                  {errorMessage}
                </p>
              )}

              <div className={styles.submitWrapper}>
                <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className={styles.footer}>
          <Link to="/login" className={styles.footerLink}>
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}