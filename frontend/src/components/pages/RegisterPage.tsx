// src/components/pages/RegisterPage.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import type { z } from 'zod';
import { registerSchema } from '../../schemas/authSchemas';
import { useAuth } from '../../context/AuthContext';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import ResultState from '../ui/ResultState';
import { getErrorMessage } from '../../utils/errors';
import styles from './RegisterPage.module.css';

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nombre: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMessage('');
    try {
      const { nombre, email, password } = values;
      const data = await registerUser({ nombre, email, password });
      setMensaje(data.message ?? 'Usuario registrado exitosamente. Revisá tu correo para confirmar la cuenta.');
      setRegistroExitoso(true);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Ocurrió un error durante el registro. Intentalo de nuevo.'));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
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

        <div className={styles.card}>
          {registroExitoso ? (
            <ResultState
              status="success"
              title="¡Ya casi estás!"
              description={mensaje}
              action={
                <Link to="/login">
                  <Button variant="secondary">Ir a iniciar sesión</Button>
                </Link>
              }
            />
          ) : (
            <>
              <h2 className={styles.cardTitle}>Registro de Usuario</h2>

              <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
                <FormField
                  label="Nombre Completo"
                  type="text"
                  icon="person"
                  placeholder="Ej. Juan Pérez"
                  error={errors.nombre?.message}
                  required
                  {...register('nombre')}
                />

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

                <div className={styles.grid2}>
                  <FormField
                    label="Contraseña"
                    type="password"
                    icon="lock"
                    placeholder="Mínimo 8 caracteres"
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

                <div className={styles.submitWrapper}>
                  <Button type="submit" variant="primary" fullWidth icon="person_add" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
                  </Button>
                </div>
              </form>
            </>
          )}
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