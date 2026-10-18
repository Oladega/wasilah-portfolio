"use client";
import { useState } from "react";
import { filters, projects } from "@/data/projects";
import { WindowFrame } from "@/components/shared/WindowFrame";
import { Icon } from "@/components/shared/Icon";
import { ProjectCard } from "./ProjectCard";
import styles from "@/components/shared/Windows.module.css";
export function WorkWindow({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = useState("all");
  return (
    <WindowFrame
      title="Work"
      size="expanded"
      onClose={onClose}
      sidebar={
        <>
          <p className={styles.sidebarLabel}>FILTERS</p>
          {filters.map((item) => (
            <button
              className={styles.sidebarButton}
              aria-pressed={filter === item.id}
              key={item.id}
              onClick={() => setFilter(item.id)}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </>
      }
    >
      <nav className={styles.filters} aria-label="Filter work">
        {filters.map((item) => (
          <button
            key={item.id}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.mobile}
          </button>
        ))}
      </nav>
      <div className={styles.workContent}>
      <div className={styles.workGrid}>
        {projects
          .filter((p) => filter === "all" || p.filter === filter || (filter === "events" && p.slug === "nacre"))
          .map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
      </div>
      <div className={styles.workDownload}>
        <a className={styles.portfolioDownload} href="/documents/portfolio.pdf" download="Atilade-Wasilah-Portfolio.pdf">Download portfolio PDF ↓</a>
      </div>
      </div>
    </WindowFrame>
  );
}
