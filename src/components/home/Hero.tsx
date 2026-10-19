import { siteConfig } from "@/data/site";
import { LocalClock } from "@/components/shared/LocalClock";
import styles from "./Home.module.css";
export function LocationStatus() {
  return (
    <aside className={styles.status} aria-label="Local time and location">
      <div className={styles.locationTime}>
        <p className={styles.location}>
          <LocalClock zone />
        </p>
        <div className={styles.clock}>
          <LocalClock />
        </div>
      </div>
      <div className={styles.available}><i />{siteConfig.availability}</div>
    </aside>
  );
}
export function Hero({ onOpenWork, subordinate = false }: { onOpenWork: (launcher: HTMLElement) => void; subordinate?: boolean }) {
  const Heading = subordinate ? "p" : "h1";
  return (
    <section className={styles.greeting} aria-label="Introduction">
      <div className={styles.specialties}>
        <i />
        {siteConfig.specialties.map((specialty, i) => (
          <span key={specialty}>
            {i > 0 && <b>⏺</b>}
            {specialty}
          </span>
        ))}
      </div>
      <Heading className={styles.headline} aria-label={subordinate ? undefined : "Wasilat Atilade — Marketing, Events & Communications"}>
        <span>{siteConfig.hero.title}</span>
        <br />
        {siteConfig.hero.description}
      </Heading>
      <button className={styles.cta} onClick={event => onOpenWork(event.currentTarget)}>
        See my work <span>↵</span>
      </button>
    </section>
  );
}
