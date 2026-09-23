// src/components/pages/RestablecerContrasenaPage.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { z } from 'zod';
import { restablecerContrasenaSchema } from '../../schemas/authSchemas';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import ResultState from '../ui/ResultState';
import styles from './LoginPage.module.css';

type RestablecerFormValues = z.infer<typeof restablecerContrasenaSchema>;

export default function RestablecerContrasenaPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [errorMessage, setErrorMessage] = useState('');
  const [exito, setExito] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RestablecerFormValues>({
    resolver: zodResolver(restablecerContrasenaSchema),
    defaultValues: { nuevaContrasena: '', confirmarContrasena: '' },
  });

  const onSubmit = async (values: RestablecerFormValues) => {
    if (!token) return;
    setErrorMessage('');
    try {
      await authApi.restablecerContrasena(token, values.nuevaContrasena);
      setExito(true);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'El enlace de recuperación es inválido o expiró.'));
    }
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <ResultState
              status="error"
              title="Enlace inválido"
              description="El enlace de recuperación no incluye un token válido."
              action={
                <Link to="/recuperar-contrasena">
                  <Button variant="secondary">Solicitar un nuevo enlace</Button>
                </Link>
              }
            />
          </div>
        </div>
      </div>
    );
  }

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
          <p className={styles.brandSub}>Restablecer contraseña</p>
        </div>

        <div className={styles.card}>
          {exito ? (
            <ResultState
              status="success"
              title="Contraseña actualizada"
              description="Ya podés iniciar sesión con tu nueva contraseña. Te redirigimos en un momento..."
            />
          ) : (
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormField
                label="Nueva Contraseña"
                type="password"
                icon="lock"
                placeholder="Mínimo 8 caracteres"
                error={errors.nuevaContrasena?.message}
                {...register('nuevaContrasena')}
              />
              <FormField
                label="Confirmar Contraseña"
                type="password"
                icon="lock_reset"
                placeholder="Repetí la contraseña"
                error={errors.confirmarContrasena?.message}
                {...register('confirmarContrasena')}
              />

              {errorMessage && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-body-sm)' }}>
                  {errorMessage}
                </p>
              )}

              <div className={styles.submitWrapper}>
                <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Restablecer contraseña'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}