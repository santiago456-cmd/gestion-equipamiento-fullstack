// components/ui/Card.jsx
import styles from './Card.module.css';

/**
 * Card — surface container with optional structured header.
 *
 * Props:
 *   title       {string}    — header title text
 *   icon        {string}    — Material Symbol name for header
 *   headerRight {ReactNode} — slot rendered on the right of the header
 *   variant     {'default'|'danger'}
 *   noPadding   {boolean}   — skip body padding (useful for tables)
 *   children    {ReactNode}
 */
export default function Card({
  title,
  icon,
  headerRight,
  variant = 'default',
  noPadding = false,
  children,
  className = '',
}) {
  const cardClass = [
    styles.card,
    variant === 'danger' ? styles.danger : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      {(title || icon) && (
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>
            {icon && (
              <span className={`material-symbols-outlined ${styles.headerIcon}`}>
                {icon}
              </span>
            )}
            {title}
          </h3>
          {headerRight && (
            <div className={styles.headerActions}>{headerRight}</div>
          )}
        </div>
      )}
      <div className={noPadding ? '' : styles.body}>
        {children}
      </div>
    </div>
  );
}
