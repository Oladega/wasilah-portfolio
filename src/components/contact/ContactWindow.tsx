"use client";
import { WindowFrame } from "@/components/shared/WindowFrame";
import { Icon } from "@/components/shared/Icon";
import styles from "./ContactWindow.module.css";
import { contacts } from "@/data/profile";
export function ContactWindow({ onClose }: { onClose: () => void }) {
  return <WindowFrame onClose={onClose} className={styles.window}>
    <div className={styles.content}>
      <p className={styles.eyebrow}>LET’S CONNECT</p>
      <h2>Have something<br /><em>in mind?</em></h2>
      <p className={styles.intro}>I’d love to hear about your next project, event or opportunity. Find me on the platform that works best for you.</p>
      <div className={styles.availability}><i />Open to work · Lagos, Nigeria</div>
      <nav className={styles.links} aria-label="Contact options">{contacts.map(item => <a key={item.title} href={item.href} target={item.href.startsWith("https:") ? "_blank" : undefined} rel={item.href.startsWith("https:") ? "noopener noreferrer" : undefined}>
        <span className={styles.icon}>{item.short || <Icon name={item.icon} size={24} />}</span>
        <span className={styles.label}><strong>{item.title}</strong><span>{item.detail}</span></span><span aria-hidden="true">↗</span>
      </a>)}</nav>
      <p className={styles.musicCredit}>Music: <a href="https://budgetpixel.com/background-music/jazzy-amapiano-bounce-cc957138" target="_blank" rel="noopener noreferrer">Jazzy Amapiano Bounce by BudgetPixel AI</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · Compressed and looped.</p>
    </div>
  </WindowFrame>;
}
