"use client";
import { useEffect, useCallback, useRef } from "react";
import { WelcomeAnimation } from "@/components/shared/WelcomeAnimation";
import { Hero, LocationStatus } from "./Hero";
import { DesktopIcons } from "./DesktopIcons";
import { useRouter } from "next/navigation";
import type { Project } from "@/types/project";
import type { WindowId } from "@/data/site";
import { useWindowManager, WindowInstanceProvider } from "@/components/windows/WindowManager";
import { windowRegistry } from "@/components/windows/registry";
import { isPresented } from "@/components/windows/state";
import styles from "./Home.module.css";
export function Home({ project }: { project?: Project }) {
  const router = useRouter();
  const manager = useWindowManager();
  const { openWindow, closeWindow } = manager;
  const active = manager.activeId;
  const openedProject = useRef<string | null>(null);
  const workVisibility = manager.windows.work.visibilityState;
  useEffect(() => {
    if (project || window.location.hash === "#work") openWindow("work");
  }, [project, openWindow]);
  useEffect(() => {
    if (!project) { openedProject.current = null; return; }
    if (workVisibility !== "closed") openedProject.current = project.slug;
    else if (openedProject.current === project.slug) router.push("/");
  }, [project, workVisibility, router]);
  const closeById = useCallback((id: WindowId) => {
    closeWindow(id);
    if (id !== "work") return;
    if (window.location.hash === "#work") window.history.replaceState(null, "", "/");
  }, [closeWindow]);
  const close = useCallback(() => { if (active) closeById(active); }, [active, closeById]);
  const open = (id: WindowId, launcher?: HTMLElement) => openWindow(id, launcher);
  return (
    <>
      <div className={styles.home} data-desktop-background>
        <DesktopIcons active={active} onOpen={open} />
        <LocationStatus />
        <Hero onOpenWork={launcher => open("work", launcher)} />
      </div>
      {manager.order.length > 0 && <div className={styles.modalLayer} style={{ zIndex: 109 }}><button className={styles.backdrop} aria-label="Dismiss overlay" tabIndex={-1} onClick={close} /></div>}
      {manager.order.map(id => {
        const state = manager.windows[id];
        if (state.visibilityState === "closed") return null;
        const Content = windowRegistry[id].component;
        return <div key={id} className={styles.modalLayer} data-window-layer={id} style={{ zIndex: 110 + manager.getZIndex(id), pointerEvents: "none", display: isPresented(state) ? undefined : "none" }}>
          <WindowInstanceProvider value={id}>
            <div style={{ position: "absolute", inset: 0, zIndex: manager.getZIndex(id), pointerEvents: "none" }} onPointerDownCapture={() => manager.focusWindow(id)} onFocusCapture={() => manager.focusWindow(id)}>
              <Content onClose={() => closeById(id)} project={id === "work" ? project : undefined} />
            </div>
          </WindowInstanceProvider>
        </div>;
      })}
      <WelcomeAnimation skip={!!project || !!active} />
    </>
  );
}
