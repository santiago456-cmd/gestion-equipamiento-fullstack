// components/pages/LoginPage.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema } from '../../schemas/authSchemas';
import { useAuth } from '../../context/AuthContext';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import styles from './LoginPage.module.css';

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
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setErrorMessage('');
    try {
      await login(values);
      const redirectTo = location.state?.from?.pathname ?? '/solicitudes';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrorMessage(err.message ?? 'Credenciales inválidas.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Brand header */}
        <div className={styles.brand}>
          <div className={styles.brandIconWrap}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}
            >
              inventory_2
            </span>
          </div>
          <h1 className={styles.brandTitle}>EquiManage Pro</h1>
          <p className={styles.brandSub}>Portal de Administración Segura</p>
        </div>

        {/* Login card */}
        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <FormField
              label="Correo Electrónico"
              type="email"
              icon="mail"
              placeholder="ejemplo@empresa.com"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password */}
            <div>
              <FormField
                label="Contraseña"
                type="password"
                icon="lock"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {/* Global error (e.g. wrong credentials) */}
            {errorMessage && (
              <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-body-sm)' }}>
                {errorMessage}
              </p>
            )}

            <div className={styles.submitWrapper}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                iconAfter="arrow_forward"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
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
