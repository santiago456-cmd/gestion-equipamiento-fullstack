// components/layout/TopBar.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './TopBar.module.css';

const ROLE_LABELS = {
  admin: 'Administrador',
  encargado: 'Encargado',
  usuario: 'Usuario',
};

/**
 * TopBar — sticky top navigation bar.
 * Muestra el usuario autenticado y permite cerrar sesión.
 */
export default function TopBar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className={styles.header}>
      {/* Mobile brand */}
      <div className={styles.mobileBrand}>
        <span className={styles.mobileBrandText}>EquiManage Pro</span>
      </div>

      {/* Spacer */}
      <div className={styles.searchWrapper} />

      {/* Right actions */}
      <div className={styles.actions}>
        <div className={styles.divider} />

        <div className={styles.userCluster}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{usuario?.nombre ?? 'Usuario'}</span>
            <span className={styles.userRole}>
              {ROLE_LABELS[usuario?.rol] ?? usuario?.rol ?? ''}
            </span>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}
