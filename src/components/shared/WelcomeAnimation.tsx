"use client";
import { useEffect, useState } from "react";
import { siteConfig } from "@/data/site";
import styles from "./WelcomeAnimation.module.css";
let welcomeSeen = false;
export function WelcomeAnimation({ skip = false }: { skip?: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const frame = requestAnimationFrame(() => {
      if (welcomeSeen) return;
      welcomeSeen = true;
      try {
        if (sessionStorage.getItem("portfolio-welcome-seen")) return;
        sessionStorage.setItem("portfolio-welcome-seen", "1");
      } catch { /* Keep navigation usable when browser storage is unavailable. */ }
      if (skip || window.location.hash === "#work") return;
      setVisible(true);
      timer = setTimeout(() => setVisible(false), 1800);
    });
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [skip]);
  if (!visible) return null;
  return (
    <div className={styles.welcome} aria-hidden="true">
      <p>{siteConfig.name}</p>
      <span className={styles.spinner} />
    </div>
  );
}
