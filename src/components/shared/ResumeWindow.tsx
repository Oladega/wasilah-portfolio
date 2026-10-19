"use client";
import { siteConfig } from "@/data/site";
import { WindowFrame } from "./WindowFrame";
import { ResumePdfViewer } from "@/components/resume/ResumePdfViewer";
import styles from "./Windows.module.css";
export function ResumeWindow({ onClose, compact = false }: { onClose: () => void; compact?: boolean }) {
  return <WindowFrame size={compact ? "default" : undefined} onClose={onClose} className={`${styles.resume} ${compact ? styles.resumeCompact : styles.resumeDefault}`}>
    <a className={styles.topDownload} href={siteConfig.resume.path} download={siteConfig.resume.filename}>Download ↓</a>
    <ResumePdfViewer compact={compact}/>
  </WindowFrame>;
}
