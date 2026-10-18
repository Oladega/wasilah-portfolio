"use client";
import { useRef } from "react";
import { ResponsiveImage as Image } from "@/components/shared/ResponsiveImage";
import { useReducedMotion } from "motion/react";
import { siteConfig } from "@/data/site";
import { WindowFrame } from "@/components/shared/WindowFrame";
import { Icon } from "@/components/shared/Icon";
import styles from "./AboutWindow.module.css";
export function AboutWindow({ onClose }: { onClose: () => void }) {
  const content = useRef<HTMLDivElement>(null);
  const capabilities = useRef<HTMLElement>(null);
  const impact = useRef<HTMLElement>(null);
  const awards = useRef<HTMLElement>(null);
  const tools = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const about = siteConfig.about;
  const scrollTo = (node: HTMLElement | null) => {
    if (!node || !content.current) return;
    content.current.scrollTo({ top: content.current.scrollTop + node.getBoundingClientRect().top - content.current.getBoundingClientRect().top - 28, behavior: reduced ? "instant" : "smooth" });
  };
  return (
    <WindowFrame title="About Wasilah" onClose={onClose} size="expanded" sidebar={
      <nav className={styles.navigation} aria-label="About sections">
        <button onClick={() => content.current?.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" })}><Icon name="user" />About me</button>
        <button onClick={() => scrollTo(capabilities.current)}><Icon name="badge" />What I do</button>
        <button onClick={() => scrollTo(impact.current)}><Icon name="chart" />My impact</button>
        <button onClick={() => scrollTo(awards.current)}><Icon name="badge" />Awards</button>
        <button onClick={() => scrollTo(tools.current)}><Icon name="tools" />Tools I use</button>
      </nav>
    }>
      <div ref={content} className={styles.content}>
        <div className={styles.photos} aria-label="Photo of Wasilah">
          <div className={styles.photo}><Image src={about.candid} alt="Wasilah at a costume event" fill sizes="(max-width:809px) 80vw, 350px" priority /></div>
        </div>
        <div className={styles.copy}>
          <h2>{about.title}</h2>
          <div className={styles.paragraphs}>{about.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
          <section className={styles.details} ref={capabilities} aria-labelledby="about-capabilities">
            <h3 id="about-capabilities">What I do</h3>
            <p>{about.capabilitiesIntro}</p>
            <div className={styles.capabilities}>{about.capabilities.map(group => <div key={group.title}><h4>{group.title}</h4><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div>
          </section>
          <section className={styles.details} ref={impact} aria-labelledby="about-impact">
            <h3 id="about-impact">Evidence of impact & experience</h3>
            <dl className={styles.impact}>{about.impact.map(item => <div key={item.label}><dt>{item.value}</dt><dd>{item.label}</dd></div>)}</dl>
          </section>
          <section className={styles.details} ref={awards} aria-labelledby="about-awards">
            <h3 id="about-awards">Awards</h3>
            <div className={styles.awards}>
              {about.awards.map(group => <section key={group.year} aria-labelledby={`awards-${group.year}`}>
                <h4 id={`awards-${group.year}`}>{group.year}</h4>
                <ul>{group.items.map(award => <li key={award.title}>
                  <Icon name="badge" size={20} />
                  <span>{award.title}</span>
                </li>)}</ul>
              </section>)}
            </div>
          </section>
          <section className={styles.details} ref={tools} aria-labelledby="about-tools"><h3 id="about-tools">Tools I use</h3><div className={styles.tags}>{about.tools.map(text => <span key={text}>{text}</span>)}</div></section>
        </div>
      </div>
    </WindowFrame>
  );
}
