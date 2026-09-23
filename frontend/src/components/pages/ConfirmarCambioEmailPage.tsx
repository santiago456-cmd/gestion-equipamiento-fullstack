// src/components/pages/ConfirmarCambioEmailPage.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usuarioApi } from '../../api/usuarioApi';
import { getErrorMessage } from '../../utils/errors';
import ResultState from '../ui/ResultState';
import Button from '../ui/Button';
import styles from './ConfirmarCuentaPage.module.css';

type Estado = 'loading' | 'success' | 'error';

/**
 * ConfirmarCambioEmailPage — se accede desde el link del mail de confirmación
 * de cambio de correo (GET /api/usuarios/confirmar-cambio-email/:token). Pública.
 */
export default function ConfirmarCambioEmailPage() {
  const { token } = useParams();
  const [estado, setEstado] = useState<Estado>('loading');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!token) {
      setEstado('error');
      setMensaje('El enlace de confirmación no es válido.');
      return;
    }

    usuarioApi
      .confirmarCambioEmail(token)
      .then((data) => {
        setEstado('success');
        setMensaje(data.mensaje ?? data.message ?? 'Correo electrónico actualizado exitosamente.');
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
          {estado === 'loading' && <ResultState status="loading" title="Confirmando tu nuevo correo..." />}
          {estado === 'success' && (
            <ResultState
              status="success"
              title="¡Correo actualizado!"
              description={mensaje}
              action={
                <Link to="/perfil">
                  <Button variant="primary">Ir a Mi Perfil</Button>
                </Link>
              }
            />
          )}
          {estado === 'error' && (
            <ResultState
              status="error"
              title="No pudimos confirmar el cambio"
              description={mensaje}
              action={
                <Link to="/perfil">
                  <Button variant="secondary">Volver a Mi Perfil</Button>
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}