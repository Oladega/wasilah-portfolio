"use client";
import { useRef } from "react";
import { motion, useDragControls, useReducedMotion } from "motion/react";
import styles from "./Windows.module.css";
import { useDialogFocus } from "@/hooks/useDialogFocus";
export function TrafficLights({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.lights}>
      <button
        onClick={onClose}
        aria-label="Close window"
        className={styles.red}
      >
        <span>×</span>
      </button>
      <i className={styles.yellow} />
      <i className={styles.green} />
    </div>
  );
}
export function CloseButton({ onClose }: { onClose: () => void }) {
  return <button onClick={onClose} className={styles.close}>Close</button>;
}
export function WindowFrame({
  title,
  onClose,
  children,
  className = "",
  size = "default",
  sidebar,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "expanded";
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const controls = useDragControls();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, onClose);
  return (
    <div className={styles.overlay}>
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        drag={!reduced}
        dragListener={false}
        dragControls={controls}
        dragMomentum={false}
        initial={reduced ? false : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
        className={`${styles.frame} ${size === "expanded" ? styles.expanded : ""} ${className}`}
      >
        {sidebar && (
          <aside className={styles.sidebar}>
            <div className={styles.sidebarLights}>
              <TrafficLights onClose={onClose} />
            </div>
            {sidebar}
          </aside>
        )}
        <div className={styles.main}>
          <header
            className={styles.titlebar}
            onPointerDown={(e) => {
              if (e.target instanceof Element && !e.target.closest("button,a"))
                controls.start(e);
            }}
          >
            <div className={sidebar ? styles.mobileLights : ""}>
              <TrafficLights onClose={onClose} />
            </div>
            <strong>
              {sidebar && <span className={styles.chevrons}>‹ ›</span>}
              {title}
            </strong>
            <CloseButton onClose={onClose} />
          </header>
          {children}
          {footer}
        </div>
      </motion.div>
    </div>
  );
}
