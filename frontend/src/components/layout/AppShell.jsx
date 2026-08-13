// components/layout/AppShell.jsx
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import styles from './AppShell.module.css';

/**
 * AppShell — full-page layout shell.
 * Renders Sidebar + TopBar and wraps children in the scrollable canvas.
 *
 * Props:
 *   children     {ReactNode} — page content
 *   topBarProps  {object}    — forwarded to <TopBar />
 */
export default function AppShell({ children, topBarProps = {} }) {
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
