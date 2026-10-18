"use client";
import { useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/data/site";
import { WindowFrame } from "./WindowFrame";
import styles from "./Windows.module.css";
export function ResumeWindow({
  onClose,
  compact = false,
}: {
  onClose: () => void;
  compact?: boolean;
}) {
  const [page, setPage] = useState(1);
  return (
    <WindowFrame
      title="Résumé.pdf"
      size={compact ? "default" : "expanded"}
      onClose={onClose}
      className={`${styles.resume} ${compact ? styles.resumeCompact : styles.resumeDefault}`}
      footer={
        <div className={styles.downloadBar}>
          <a
            className={styles.download}
            href={siteConfig.resume.path}
            download={siteConfig.resume.filename}
          >
            Download ↓
          </a>
        </div>
      }
    >
      <a
        className={styles.topDownload}
        href={siteConfig.resume.path}
        download={siteConfig.resume.filename}
      >
        Download ↓
      </a>
      <div className={styles.pdfBody}>
        <aside className={styles.pdfRail}>
          {siteConfig.resume.pages.map((src, i) => (
            <button
              key={src}
              data-current={page === i + 1}
              onClick={() => {
                document
                  .getElementById(`resume-page-${i + 1}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <Image
                src={src}
                alt={`Go to page ${i + 1}`}
                width={110}
                height={156}
              />
              <span>{i + 1}</span>
            </button>
          ))}
        </aside>
        <div
          className={styles.pdfScroll}
          onScroll={(e) => {
            const el = e.currentTarget;
            setPage(el.scrollTop > el.scrollHeight / 3 ? 2 : 1);
          }}
        >
          {siteConfig.resume.pages.map((src, i) => (
            <Image
              id={`resume-page-${i + 1}`}
              className={styles.pdfPage}
              src={src}
              alt={`Wasilat Atilade résumé, page ${i + 1} of 2`}
              width={1188}
              height={1680}
              key={src}
            />
          ))}
        </div>
        <span className={styles.pageCounter}>{page} / 2</span>
      </div>
    </WindowFrame>
  );
}
