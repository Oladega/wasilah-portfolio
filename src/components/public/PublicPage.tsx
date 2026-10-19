import Link from 'next/link';
import Image from 'next/image';
import {siteConfig} from '@/data/site';
import {professionalProfile} from '@/data/profile';
import styles from './PublicPage.module.css';
export function PublicPage({title,section,children}:{title:string;section:string;children:React.ReactNode}){
 return <main className={styles.desktop}><picture className={styles.wallpaper}><source sizes="100vw" srcSet={`${siteConfig.wallpaper.mobile} 640w, ${siteConfig.wallpaper.tablet} 1024w, ${siteConfig.wallpaper.desktop} 1672w`}/><Image src={siteConfig.wallpaper.desktop} alt="" fill sizes="100vw" loading="eager" fetchPriority="high"/></picture>
  <header className={styles.menu}><Link prefetch={false} href="/">{professionalProfile.name}</Link><span>Portfolio</span></header>
  <article className={styles.window}>
   <header className={styles.header}><Link prefetch={false} className={styles.close} href="/" aria-label="Back to desktop">●</Link><span>{section}</span><Link prefetch={false} href={`/?window=${section==='About'?'about':section==='Work'?'work':section==='Résumé'?'resume':'contact'}`}>Open on desktop ↗</Link></header>
   <nav className={styles.nav} aria-label="Portfolio pages">{[['/','Desktop'],['/about','About'],['/work','Work'],['/resume','Résumé'],['/contact','Contact']].map(([href,label])=><Link prefetch={false} href={href} key={href} aria-current={label===section?'page':undefined}>{label}</Link>)}</nav>
   <div className={styles.content}><h1>{title}</h1>{children}</div>
  </article>
 </main>;
}
