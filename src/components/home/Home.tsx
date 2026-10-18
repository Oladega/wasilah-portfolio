"use client";
import { useEffect, useState } from "react";
import { WelcomeAnimation } from "@/components/shared/WelcomeAnimation";
import { Hero, AvailabilityStatus } from "./Hero";
import { DesktopIcons } from "./DesktopIcons";
import { AboutWindow } from "@/components/about/AboutWindow";
import { WorkWindow } from "@/components/work/WorkWindow";
import { ContactWindow } from "@/components/contact/ContactWindow";
import { ResumeWindow } from "@/components/shared/ResumeWindow";
import { useRouter } from "next/navigation";
import { ProjectPage } from "@/components/work/ProjectPage";
import type { Project } from "@/types/project";
import type { WindowId } from "@/data/site";
import styles from "./Home.module.css";
export function Home({ project }: { project?: Project }) {
  const router = useRouter();
  const [active, setActive] = useState<WindowId | null>(null);
  useEffect(() => {
    if (project || window.location.hash !== "#work") return;
    const frame = requestAnimationFrame(() => setActive("work"));
    return () => cancelAnimationFrame(frame);
  }, [project]);
  function open(id: WindowId) {
    setActive((current) => current === null ? id : null);
  }
  function close() {
    if (project) { router.push("/"); return; }
    setActive(null);
    if (window.location.hash === "#work") window.history.replaceState(null, "", "/");
  }
  return (
    <>
      <div className={styles.home}>
        <DesktopIcons active={active} onOpen={open} />
        <AvailabilityStatus />
        <Hero onOpenWork={() => open("work")} />
      </div>
      {(active || project) && (
        <div className={styles.modalLayer}>
          <button
            className={styles.backdrop}
            aria-label="Dismiss overlay"
            tabIndex={-1}
            onClick={close}
          />
          {project ? (
            <ProjectPage project={project} />
          ) : active === "about" ? (
            <AboutWindow onClose={close} />
          ) : active === "work" ? (
            <WorkWindow onClose={close} />
          ) : active === "contact" ? (
            <ContactWindow onClose={close} />
          ) : (
            <ResumeWindow onClose={close} />
          )}
        </div>
      )}
      <WelcomeAnimation skip={!!project} />
    </>
  );
}
