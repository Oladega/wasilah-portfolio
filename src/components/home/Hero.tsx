import { siteConfig } from "@/data/site";
import { LocalClock } from "@/components/shared/LocalClock";
import styles from "./Home.module.css";
export function AvailabilityStatus() {
  return (
    <aside className={styles.status} aria-label="Location and availability">
      <div className={styles.locationTime}>
        <p className={styles.location}>
          <LocalClock zone />
        </p>
        <div className={styles.clock}>
          <LocalClock />
        </div>
      </div>
      <div className={styles.available}>
        <i />
        {siteConfig.availability}
      </div>
    </aside>
  );
}
export function Hero({ onOpenWork }: { onOpenWork: () => void }) {
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
      <h1 className={styles.headline}>
        <span>{siteConfig.hero.title}</span>
        <br />
        {siteConfig.hero.description}
      </h1>
      <button className={styles.cta} onClick={onOpenWork}>
        See my work <span>↵</span>
      </button>
    </section>
  );
}
