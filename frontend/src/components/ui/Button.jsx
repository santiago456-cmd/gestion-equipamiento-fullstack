// components/ui/Button.jsx
import styles from './Button.module.css';

/**
 * Button — unified button with variant + size system.
 *
 * Props:
 *   variant    {'primary'|'secondary'|'ghost'|'danger'|'neutral'}
 *   size       {'sm'|'md'|'lg'}
 *   fullWidth  {boolean}
 *   icon       {string}  — Material Symbol name (optional, renders before label)
 *   iconAfter  {string}  — Material Symbol name (optional, renders after label)
 *   type       {'button'|'submit'|'reset'}
 *   disabled   {boolean}
 *   onClick    {Function}
 *   children   {ReactNode}
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconAfter,
  type = 'button',
  disabled = false,
  onClick,
  children,
  className = '',
}) {
  const classes = [
    styles.button,
    styles[variant],
    size !== 'md' ? styles[size] : '',
    fullWidth ? styles.fullWidth : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {icon}
        </span>
      )}
      {children}
      {iconAfter && (
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {iconAfter}
        </span>
      )}
    </button>
  );
}
