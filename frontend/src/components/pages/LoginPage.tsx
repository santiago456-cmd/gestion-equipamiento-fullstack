// components/pages/LoginPage.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { z } from 'zod';
import { loginSchema } from '../../schemas/authSchemas';
import { useAuth } from '../../context/AuthContext';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import { getErrorMessage } from '../../utils/errors';
import styles from './LoginPage.module.css';

type LoginFormValues = z.infer<typeof loginSchema>;

interface LocationState {
  from?: { pathname?: string };
}

/**
 * LoginPage — standalone authentication screen.
 * No AppShell — rendered fullscreen without sidebar/topbar.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage('');
    try {
      await login(values);
      const state = location.state as LocationState | null;
      const redirectTo = state?.from?.pathname ?? '/solicitudes';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Credenciales inválidas.'));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.brandIconWrap}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
          </div>
          <h1 className={styles.brandTitle}>EquiManage Pro</h1>
          <p className={styles.brandSub}>Portal de Administración Segura</p>
        </div>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField
              label="Correo Electrónico"
              type="email"
              icon="mail"
              placeholder="ejemplo@empresa.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <FormField
                label="Contraseña"
                type="password"
                icon="lock"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <div style={{ textAlign: 'right', marginTop: 'var(--space-xs)' }}>
                <Link
                  to="/recuperar-contrasena"
                  style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-secondary)' }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {errorMessage && (
              <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-body-sm)' }}>
                {errorMessage}
              </p>
            )}

            <div className={styles.submitWrapper}>
              <Button type="submit" variant="primary" fullWidth iconAfter="arrow_forward" disabled={isSubmitting}>
                {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
            </div>
          </form>
        </div>

        <p className={styles.footer}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className={styles.footerLink}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}