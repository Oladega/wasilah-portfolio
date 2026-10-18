"use client";
import { useCallback, useEffect, useState } from "react";
import { siteConfig } from "@/data/site";
import styles from "./WelcomeAnimation.module.css";

let welcomeSeen = false;
export function WelcomeAnimation({ skip = false }: { skip?: boolean }) {
  const [visible, setVisible] = useState(!skip);
  const finish = useCallback(() => {
    document.documentElement.dataset.portfolioWelcome = "seen";
    setVisible(false);
  }, []);

  useEffect(() => {
    let fallback: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => {
      const shouldPlay = !welcomeSeen && !skip &&
        document.documentElement.dataset.portfolioWelcome === "show";
      welcomeSeen = true;
      try { sessionStorage.setItem("portfolio-welcome-seen", "1"); }
      catch { /* The in-memory flag still prevents repeat animations. */ }
      if (!shouldPlay) { finish(); return; }
      // Animation completion controls dismissal; this also handles interrupted animations.
      fallback = setTimeout(finish, 3000);
    });
    return () => { cancelAnimationFrame(frame); clearTimeout(fallback); };
  }, [skip, finish]);

  if (!visible) return null;
  return (
    <div
      className={styles.welcome}
      role="status"
      aria-label={`Loading ${siteConfig.name}’s portfolio`}
      onAnimationEnd={(event) => { if (event.target === event.currentTarget) finish(); }}
    >
      <p>{siteConfig.name}</p>
      <span className={styles.spinner} aria-hidden="true" />
    </div>
  );
}
