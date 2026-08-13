// components/ui/Avatar.jsx
import styles from './Avatar.module.css';

const PALETTES = ['palette0', 'palette1', 'palette2', 'palette3'];

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function getPalette(name = '') {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTES[code % PALETTES.length];
}

/**
 * Avatar — initials-based avatar with optional image.
 *
 * Props:
 *   name  {string}  — full name (used for initials + accessible label)
 *   src   {string}  — optional image URL
 *   size  {'sm'|'md'|'lg'|'xl'}
 */
export default function Avatar({ name = '', src, size = 'md' }) {
  const initials = getInitials(name);
  const palette = getPalette(name);

  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${src ? '' : styles[palette]}`}
      title={name}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} className={styles.img} />
      ) : (
        initials
      )}
    </div>
  );
}
