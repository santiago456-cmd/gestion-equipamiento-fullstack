// components/layout/AppShell.tsx
import type { ReactNode, ComponentProps } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import styles from './AppShell.module.css';

interface AppShellProps {
  /** Page content */
  children: ReactNode;
  /** Forwarded to <TopBar /> */
  topBarProps?: ComponentProps<typeof TopBar>;
}

/**
 * AppShell — full-page layout shell.
 * Renders Sidebar + TopBar and wraps children in the scrollable canvas.
 */
export default function AppShell({ children, topBarProps = {} }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <TopBar {...topBarProps} />
        <main className={styles.canvas}>
          <div className={styles.canvasInner}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}