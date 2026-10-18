"use client";
import { WindowFrame } from "@/components/shared/WindowFrame";
import { Icon } from "@/components/shared/Icon";
import styles from "./ContactWindow.module.css";
const contacts = [
  { title: "Message me on LinkedIn", detail: "Connect and talk about opportunities", href: "https://www.linkedin.com/in/wasilat-atilade-2b54a823a/", icon: "linkedin", short: "in" },
  { title: "Send me an email", detail: "wasilahatilade01@gmail.com", href: "mailto:wasilahatilade01@gmail.com", icon: "mail", short: "" },
  { title: "Chat with me on WhatsApp", detail: "+234 814 243 8558", href: "https://wa.me/2348142438558", icon: "chat", short: "" },
  { title: "Follow me on Twitter", detail: "@TheWasilah", href: "https://x.com/TheWasilah", icon: "twitter", short: "𝕏" },
];
export function ContactWindow({ onClose }: { onClose: () => void }) {
  return <WindowFrame title="Contact Me" onClose={onClose} className={styles.window}>
    <div className={styles.content}>
      <p className={styles.eyebrow}>LET’S CONNECT</p>
      <h2>Have something<br /><em>in mind?</em></h2>
      <p className={styles.intro}>I’d love to hear about your next project, event or opportunity. Find me on the platform that works best for you.</p>
      <div className={styles.availability}><i />Available for projects · Lagos, Nigeria</div>
      <nav className={styles.links} aria-label="Contact options">{contacts.map(item => <a key={item.title} href={item.href} target={item.href.startsWith("https:") ? "_blank" : undefined} rel={item.href.startsWith("https:") ? "noopener noreferrer" : undefined}>
        <span className={styles.icon}>{item.short || <Icon name={item.icon} size={24} />}</span>
        <span className={styles.label}><strong>{item.title}</strong><span>{item.detail}</span></span><span aria-hidden="true">↗</span>
      </a>)}</nav>
    </div>
  </WindowFrame>;
}
