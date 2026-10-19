import { useWindowManager } from "@/components/windows/WindowManager";
import Image from "next/image";
import optimizedVariants from "@/data/optimized-image-variants.json";
import { motion } from "motion/react";
import { navigation, type WindowId } from "@/data/site";
import styles from "./Home.module.css";
export function DesktopIcons({
  active,
  onOpen,
}: {
  active: WindowId | null;
  onOpen: (id: WindowId, launcher?: HTMLElement) => void;
}) {
  const { registerIcon } = useWindowManager();
  return (
    <nav aria-label="Portfolio" className={styles.icons}>
      {navigation.map((item) => (
        <motion.a
          ref={element => registerIcon(item.id, element)}
          data-window-launcher={item.id}
          href={`/${item.id}`}
          drag
          dragMomentum={false}
          key={item.id}
          className={`${styles.icon} ${styles[item.id]} ${active === item.id ? styles.selected : ""}`}
          onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onOpen(item.id, event.currentTarget); }}
        >
          <picture>
            <source
              media="(max-width:809.98px)"
              srcSet={(optimizedVariants as Record<string,string>)[item.mobileImage ?? item.image] ?? item.mobileImage ?? item.image}
              sizes="60px"
            />
            <source srcSet={(optimizedVariants as Record<string,string>)[item.image]} sizes="68px" />
            <Image
              src={item.image}
              width={68}
              height={68}
              alt=""
              draggable={false}
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          <span className={styles.desktopLabel}>{item.label}</span>
          <span className={styles.mobileLabel}>{item.mobileLabel}</span>
        </motion.a>
      ))}
    </nav>
  );
}
