import { ResponsiveImage as Image } from "@/components/shared/ResponsiveImage";
import Link from "next/link";
import type { Project } from "@/types/project";
import styles from "@/components/shared/Windows.module.css";
import { projectOrderStyle } from "@/lib/project-order";
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/work/${project.slug}`} className={styles.card} style={projectOrderStyle(project.slug)} data-project-slug={project.slug}>
      <div className={styles.thumbnail}>
        <Image
          style={{ objectPosition: project.thumbnailPosition }}
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 809px) 90vw, 420px"
        />
        <span className={styles.openPill}>Open ↵</span>
      </div>
      <h3 className={styles.cardTitle}>
        <span>{project.title}</span>
      </h3>
      <p className={styles.category}>{project.category}</p>
    </Link>
  );
}
