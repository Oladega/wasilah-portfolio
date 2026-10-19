"use client";
import { useRef } from "react";
import { motion, useDragControls, useReducedMotion } from "motion/react";
import { useWindowInstance } from "@/components/windows/WindowManager";
import { windowRegistry } from "@/components/windows/registry";
import { useWindowTransition } from "@/components/windows/useWindowTransition";
import { isPresented } from "@/components/windows/state";
import styles from "./Windows.module.css";
import { WindowControls } from "./WindowControls";
import { useDialogFocus } from "@/hooks/useDialogFocus";
export function CloseButton({ onClose }: { onClose: () => void }) {
  return <button onClick={onClose} className={styles.close}>Close</button>;
}
export function WindowFrame({
  title,
  onClose,
  children,
  className = "",
  size,
  sidebar,
  footer,
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "expanded";
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const instance = useWindowInstance();
  const effectiveTitle = instance ? windowRegistry[instance.id].title : title ?? "Window";
  const effectiveSize = size ?? (instance ? windowRegistry[instance.id].sizing : "default");
  const maximized = instance?.state.sizeMode === "maximized";
  const controls = useDragControls();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useWindowTransition(ref);
  useDialogFocus(ref, onClose, !instance || (isPresented(instance.state) && instance.manager.activeId === instance.id), !instance?.manager.desktop);
  return (
    <div className={styles.overlay}>
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        data-window-id={instance?.id}
        data-window-state={instance?.state.visibilityState}
        data-window-active={instance?.manager.activeId === instance?.id}
        aria-modal={!instance?.manager.desktop}
        aria-label={effectiveTitle}
        drag={!!instance?.manager.desktop && !reduced && !maximized && instance?.state.visibilityState === "open" && !instance.state.sizeTransition}
        onDragEnd={(_, info) => { if (instance) instance.manager.setPosition(instance.id, { x: instance.state.position.x + info.offset.x, y: instance.state.position.y + info.offset.y }); }}
        dragListener={false}
        dragControls={controls}
        dragMomentum={false}
        initial={false}
        animate={{ x: instance?.state.position.x ?? 0, y: instance?.state.position.y ?? 0 }}
        transition={{ duration: 0 }}
        className={`${styles.frame} ${effectiveSize === "expanded" ? styles.expanded : ""} ${maximized ? styles.maximized : ""} ${className}`}
      >
        {sidebar && (
          <aside className={styles.sidebar}>
            <div className={styles.sidebarLights}>
              <WindowControls onClose={onClose} />
            </div>
            {sidebar}
          </aside>
        )}
        <div className={styles.main}>
          <header
            className={styles.titlebar}
            onPointerDown={(e) => {
              if (!instance?.manager.desktop) return;
              if (instance && (instance.state.visibilityState !== "open" || instance.state.sizeTransition || maximized)) return;
              if (e.target instanceof Element && !e.target.closest("button,a"))
                controls.start(e);
            }}
          >
            <div className={sidebar ? styles.mobileLights : ""}>
              <WindowControls onClose={onClose} />
            </div>
            <strong>
              {sidebar && <span className={styles.chevrons}>‹ ›</span>}
              {effectiveTitle}
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
