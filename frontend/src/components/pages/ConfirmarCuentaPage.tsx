// src/components/pages/ConfirmarCuentaPage.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import ResultState from '../ui/ResultState';
import Button from '../ui/Button';
import styles from './ConfirmarCuentaPage.module.css';

type EstadoConfirmacion = 'loading' | 'success' | 'error';

/**
 * ConfirmarCuentaPage — se accede desde el link del mail de confirmación
 * de cuenta (GET /api/auth/confirmar/:token). Pública, sin AppShell.
 */
export default function ConfirmarCuentaPage() {
  const { token } = useParams();
  const [estado, setEstado] = useState<EstadoConfirmacion>('loading');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!token) {
      setEstado('error');
      setMensaje('El enlace de confirmación no es válido.');
      return;
    }

    authApi
      .confirmarCuenta(token)
      .then((data) => {
        setEstado('success');
        setMensaje(data.mensaje ?? data.message ?? 'Cuenta confirmada exitosamente.');
      })
      .catch((err) => {
        setEstado('error');
        setMensaje(getErrorMessage(err, 'El enlace de confirmación es inválido o expiró.'));
      });
  }, [token]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          {estado === 'loading' && (
            <ResultState status="loading" title="Confirmando tu cuenta..." />
          )}
          {estado === 'success' && (
            <ResultState
              status="success"
              title="¡Cuenta confirmada!"
              description={mensaje}
              action={
                <Link to="/login">
                  <Button variant="primary">Ir a iniciar sesión</Button>
                </Link>
              }
            />
          )}
          {estado === 'error' && (
            <ResultState
              status="error"
              title="No pudimos confirmar tu cuenta"
              description={mensaje}
              action={
                <Link to="/login">
                  <Button variant="secondary">Volver al inicio</Button>
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}