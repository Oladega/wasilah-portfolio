'use client';
import { useWindowInstance } from '@/components/windows/WindowManager';
import { windowRegistry } from '@/components/windows/registry';
import styles from './Windows.module.css';

export function WindowControls({ onClose, title }: { onClose: () => void; title?: string }) {
  const instance = useWindowInstance();
  const definition = instance ? windowRegistry[instance.id] : null;
  const label = title ?? definition?.controlLabel ?? 'window';
  const maximized = instance?.state.sizeMode === 'maximized';
  const canMaximize = !!instance && !!definition?.canMaximize;
  return <div className={styles.lights} role="group" aria-label={`${label} window controls`}>
    <button type="button" onClick={onClose} aria-label={`Close ${label}`} title={`Close ${label}`} className={styles.red}>
      <svg aria-hidden="true" viewBox="0 0 12 12"><path d="m3.5 3.5 5 5m0-5-5 5" /></svg>
    </button>
    <button type="button" className={styles.yellow} disabled aria-label="Minimize unavailable" title="Minimize unavailable" />
    <button type="button" className={styles.green} aria-label={`${maximized ? 'Restore' : 'Maximize'} ${label}`} title={canMaximize ? `${maximized ? 'Restore' : 'Maximize'} ${label}` : 'Maximize unavailable'} disabled={!canMaximize} onClick={canMaximize ? () => maximized ? instance.manager.unmaximizeWindow(instance.id) : instance.manager.maximizeWindow(instance.id) : undefined}>
      {canMaximize && <svg aria-hidden="true" viewBox="0 0 12 12">{maximized ? <path d="M2.5 5.5h3v-3m0 3-3-3m7 4h-3v3m0-3 3 3" /> : <path d="M3 5V3h2m-2 0 2.5 2.5M9 7v2H7m2 0L6.5 6.5" />}</svg>}
    </button>
  </div>;
}
