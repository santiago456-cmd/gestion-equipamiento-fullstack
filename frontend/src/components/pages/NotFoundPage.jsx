// components/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import styles from './NotFoundPage.module.css';

/**
 * NotFoundPage — ruta comodín (404).
 * Se muestra para cualquier ruta no reconocida por el router.
 */
export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <span className={`material-symbols-outlined ${styles.icon}`}>search_off</span>
        <h1 className={styles.title}>404</h1>
        <p className={styles.subtitle}>Página no encontrada</p>
        <p className={styles.description}>
          La ruta que intentaste visitar no existe o fue movida.
        </p>
        <Link to="/solicitudes">
          <Button variant="primary" icon="home">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
