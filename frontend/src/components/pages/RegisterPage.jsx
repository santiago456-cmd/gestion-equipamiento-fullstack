// components/pages/RegisterPage.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../../schemas/authSchemas';
import { useAuth } from '../../context/AuthContext';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import styles from './RegisterPage.module.css';

/**
 * RegisterPage — new user registration screen.
 * Llama a POST /api/auth/register y redirige a /login al finalizar.
 */
export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { nombre: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const { nombre, email, password } = values;
      const data = await registerUser({ nombre, email, password });
      setSuccessMessage(data.message ?? 'Usuario registrado exitosamente.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setErrorMessage(err.message ?? 'Ocurrió un error durante el registro. Intentalo de nuevo.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandIconWrap}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}
            >
              inventory_2
            </span>
          </div>
          <h1 className={styles.brandTitle}>EquiManage Pro</h1>
          <p className={styles.brandSub}>Crea tu cuenta de acceso</p>
        </div>

        {/* Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Registro de Usuario</h2>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Nombre */}
            <FormField
              label="Nombre Completo"
              type="text"
              icon="person"
              placeholder="Ej. Juan Pérez"
              error={errors.nombre?.message}
              required
              {...register('nombre')}
            />

            {/* Email */}
            <FormField
              label="Correo Electrónico"
              type="email"
              icon="mail"
              placeholder="admin@empresa.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <div className={styles.divider} />

            {/* Passwords */}
            <div className={styles.grid2}>
              <FormField
                label="Contraseña"
                type="password"
                icon="lock"
                placeholder="Mínimo 6 caracteres"
                error={errors.password?.message}
                required
                {...register('password')}
              />
              <FormField
                label="Confirmar Contraseña"
                type="password"
                icon="lock_reset"
                placeholder="Repita la contraseña"
                error={errors.confirmPassword?.message}
                required
                {...register('confirmPassword')}
              />
            </div>

            {errorMessage && (
              <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-body-sm)' }}>
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-body-sm)' }}>
                {successMessage}
              </p>
            )}

            <div className={styles.submitWrapper}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                icon="person_add"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
              </Button>
            </div>
          </form>
        </div>

        <p className={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className={styles.footerLink}>
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
