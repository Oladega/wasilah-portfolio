"use client";
import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ResponsiveImage as Image } from "@/components/shared/ResponsiveImage";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import type { Project } from "@/types/project";
import { projects } from "@/data/projects";

import { useWindowInstance } from "@/components/windows/WindowManager";
import { useWindowTransition } from "@/components/windows/useWindowTransition";
import { isPresented } from "@/components/windows/state";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { CloseButton } from "@/components/shared/WindowFrame";
import { WindowControls } from "@/components/shared/WindowControls";
import { Icon } from "@/components/shared/Icon";
import { ProjectCard } from "./ProjectCard";
import styles from "./ProjectPage.module.css";
export function ProjectPage({ project, onClose }: { project: Project; onClose?: () => void }) {
  const router = useRouter();
  const instance = useWindowInstance();
  const dialog = useRef<HTMLElement>(null);
  const close = useCallback(() => onClose ? onClose() : router.push("/"), [router, onClose]);
  useWindowTransition(dialog);
  useDialogFocus(dialog, close, !instance || (isPresented(instance.state) && instance.manager.activeId === instance.id), !instance?.manager.desktop);
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[index + 1];
  const similar = projects
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3);
  function scrollTo(id: string) {
    const el = content.current?.querySelector<HTMLElement>(`#${id}`);
    if (el && content.current)
      content.current.scrollTo({
        top: el.offsetTop - content.current.offsetTop - 24,
        behavior: reduced ? "instant" : "smooth",
      });
  }
  return (
    <>
      <article
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        data-window-id={instance?.id}
        data-window-state={instance?.state.visibilityState}
        data-window-active={instance?.manager.activeId === instance?.id}
        aria-modal={!instance?.manager.desktop}
        className={`${styles.window} ${instance?.state.sizeMode === "maximized" ? styles.maximized : ""}`}
        aria-label={`${project.title} project`}
      >
        <header className={styles.titlebar}>
          <div className={styles.trafficLights}><WindowControls title={project.title}
            onClose={close}
          /></div>
          <Link href="/#work" className={styles.back} aria-label="Back to all work">
            ‹<span className={styles.backLabel}>&nbsp; Works</span>
          </Link>
          <h1>{project.title}</h1>
          <CloseButton onClose={close} />
        </header>
        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <nav aria-label="Project sections">
              {[
                { id: "overview", icon: "document", label: "Overview" },
                ...(project.challenge ? [{ id: "challenge", icon: "flag", label: "Challenge" }] : []),
                { id: "contribution", icon: "badge", label: "My contribution" },
                { id: "gallery", icon: "palette", label: "Project gallery" },
                ...(project.results ? [{ id: "results", icon: "chart", label: "Results" }] : []),
              ].map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)}>
                  <Icon name={item.icon} />
                  {item.label}
                </button>
              ))}
            </nav>
            {next && (
              <Link href={`/work/${next.slug}`} className={styles.next}>
                <Image style={{ objectPosition: next.thumbnailPosition }} src={next.thumbnail} width={180} height={110} alt="" />
                <span>Next: {next.title} →</span>
              </Link>
            )}
          </aside>
          <div className={styles.content} ref={content}>
            <section id="overview" className={styles.overview}>
              <div className={styles.overviewStack}>
                <div className={styles.heroImage}>
                  <Image
                    style={{ objectFit: project.heroFit ?? "cover" }}
                    src={project.hero}
                    alt={project.title}
                    fill
                    priority
                    sizes="(max-width: 809px) 94vw, 920px"
                  />
                </div>
                <p className={styles.eyebrow}>
                  {project.category}{project.year ? ` · ${project.year}` : ""}
                </p>
                <h2>
                  {project.headline[0]}
                  <br />
                  <em>{project.headline[1]}</em>
                  {project.headline[2]}
                </h2>
                <p className={styles.role}>{project.role}</p>
                <p className={styles.context}>{project.context}</p>
                <p className={styles.description}>{project.description}</p>
              </div>
              <ResultsNote project={project} />
            </section>
            {project.challenge && <section
              id="challenge"
              className={`${styles.section} ${styles.prose}`}
            >
              <h3>CHALLENGE</h3>
              <p>{project.challenge}</p>
              <p>{project.response}</p>
            </section>}
            <section id="contribution" className={`${styles.section} ${styles.prose}`}>
              <h3>MY CONTRIBUTION</h3>
              <ul className={styles.contributions}>
                {project.contributions.map((item) => <li key={item}>{item}</li>)}
              </ul>
              {project.programme && <>
                <h3 className={styles.programmeHeading}>THE PROGRAMME</h3>
                <ol className={styles.programme}>
                  {project.programme.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </>}
            </section>
            <section id="gallery" className={styles.section}>
              <h3>PROJECT GALLERY</h3>
              <div className={project.photos.length === 1 ? styles.singleGallery : styles.gallery}>
                {project.photos.map((photo) => (
                  <figure key={photo.src}>
                    <a href={photo.src} target="_blank" rel="noopener noreferrer" aria-label={`View full image: ${photo.caption}`}>
                      <Image src={photo.src} alt={photo.caption} width={photo.width} height={photo.height} sizes="(max-width:809px) 90vw, 45vw" />
                    </a>
                  </figure>
                ))}
              </div>
            </section>
            {project.results && <section id="results" className={`${styles.section} ${styles.prose}`}>
              <h3>{project.slug === "nacre" ? "CONTRIBUTION & TAKEAWAY" : "RESULTS"}</h3>
              <p>{project.results}</p>
              {project.learning && <><h3>WHAT I LEARNED</h3>
              <p>{project.learning}</p></>}
            </section>}
            <section className={styles.section}>
              <h3>SIMILAR WORK</h3>
              <div className={styles.similar}>
                {similar.map((p) => (
                  <ProjectCard project={p} key={p.slug} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    </>
  );
}
function ResultsNote({ project }: { project: Project }) {
  return (
    <aside className={styles.resultNote}>
      <span className={styles.tape} />
      <h3>TL;DR</h3>
      <div className={styles.metrics}>
        {project.metrics.map((item) => (
          <div key={item.label}>
            <strong className={item.value.length > 6 ? styles.longMetric : undefined}>{item.value}</strong>
            <p>{item.label}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
