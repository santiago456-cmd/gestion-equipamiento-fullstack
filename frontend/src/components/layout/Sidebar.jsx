// components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { icon: 'list_alt', label: 'Lista de Solicitudes', href: '/solicitudes', fillIcon: true },
  { icon: 'add_circle', label: 'Nueva Solicitud', href: '/solicitudes/nueva' },
  { icon: 'analytics', label: 'Resumen Administrativo', href: '/resumen', roles: ['admin'] },
];

/**
 * Sidebar — fixed left-hand navigation.
 * Usa NavLink de react-router-dom para resaltar la ruta activa
 * y filtra ítems por rol del usuario autenticado.
 */
export default function Sidebar() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(usuario?.rol),
  );

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            corporate_fare
          </span>
        </div>
        <div>
          <p className={styles.brandName}>Gestión de Equipos</p>
          <p className={styles.brandSub}>Panel de Control</p>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaWrapper}>
        <button className={styles.ctaButton} onClick={() => navigate('/solicitudes/nueva')}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
            add
          </span>
          Crear Solicitud
        </button>
      </div>

      {/* Main navigation */}
      <nav className={styles.nav}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 20,
                    fontVariationSettings: isActive && item.fillIcon ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
