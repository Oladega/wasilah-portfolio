import { useWindowManager } from "@/components/windows/WindowManager";
import Image from "next/image";
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
        <motion.button
          ref={element => registerIcon(item.id, element)}
          data-window-launcher={item.id}
          drag
          dragMomentum={false}
          key={item.id}
          className={`${styles.icon} ${styles[item.id]} ${active === item.id ? styles.selected : ""}`}
          onClick={event => onOpen(item.id, event.currentTarget)}
        >
          <picture>
            <source
              media="(max-width:809.98px)"
              srcSet={item.mobileImage ?? item.image}
            />
            <Image
              src={item.image}
              width={68}
              height={68}
              alt=""
              draggable={false}
            />
          </picture>
          <span className={styles.desktopLabel}>{item.label}</span>
          <span className={styles.mobileLabel}>{item.mobileLabel}</span>
        </motion.button>
      ))}
    </nav>
  );
}
