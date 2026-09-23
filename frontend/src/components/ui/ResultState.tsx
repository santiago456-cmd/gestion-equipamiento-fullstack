// src/components/ui/ResultState.tsx
import type { ReactNode } from 'react';
import styles from './ResultState.module.css';

export type ResultStateStatus = 'loading' | 'success' | 'error';

interface ResultStateProps {
  status: ResultStateStatus;
  title: string;
  description?: string;
  /** Acción opcional (ej. un <Button> o <Link>) que se renderiza debajo del texto */
  action?: ReactNode;
}

const ICONS: Record<ResultStateStatus, string> = {
  loading: 'hourglass_top',
  success: 'check_circle',
  error: 'error',
};

/**
 * ResultState — pantalla de resultado para flujos de un solo paso disparados
 * por un link de email (confirmación de cuenta, cambio de email, etc.).
 */
export default function ResultState({ status, title, description, action }: ResultStateProps) {
  return (
    <div className={styles.wrapper}>
      <span className={`material-symbols-outlined ${styles.icon} ${styles[status]}`} aria-hidden="true">
        {ICONS[status]}
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}