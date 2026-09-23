// components/ui/Avatar.jsx
import styles from './Avatar.module.css';

const PALETTES = ['palette0', 'palette1', 'palette2', 'palette3'] as const;

function getInitials(name = ''): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function getPalette(name = ''): (typeof PALETTES)[number] {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTES[code % PALETTES.length];
}
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Avatar — initials-based avatar with optional image.
 *
 * Props:
 *   name  {string}  — full name (used for initials + accessible label)
 *   src   {string}  — optional image URL
 *   size  {'sm'|'md'|'lg'|'xl'}
 */

interface AvatarProps {
  /** Full name (used for initials + accessible label) */
  name?: string;
  /** Optional image URL */
  src?: string;
  size?: AvatarSize
}


export default function Avatar({ name = '', src, size = 'md' }: AvatarProps) {
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
