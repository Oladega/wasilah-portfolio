import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { LocalClock } from "@/components/shared/LocalClock";
import { SoundToggle } from "@/components/shared/SoundToggle";
import styles from "./DesktopShell.module.css";
export function DesktopShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={styles.desktop}>
      <picture data-desktop-background>
        <source
          sizes="100vw"
          srcSet={`${siteConfig.wallpaper.mobile} 640w, ${siteConfig.wallpaper.tablet} 1024w, ${siteConfig.wallpaper.desktop} 1672w`}
        />
        <Image
          src={siteConfig.wallpaper.desktop}
          alt="Soft blush peonies and ivory roses against a muted mauve background"
          fill
          priority
          sizes="100vw"
          className={styles.wallpaper}
        />
      </picture>
      <header className={styles.menu} data-desktop-background>
        <Link href="/">
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-4">
          <SoundToggle />
          <LocalClock date />
        </div>
      </header>
      {children}
    </main>
  );
}
