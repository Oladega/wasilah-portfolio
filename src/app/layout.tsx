import { DesktopBoundary } from "@/components/layout/DesktopBoundary";
import type { Metadata } from "next";
import { portfolioMetadata } from "@/lib/metadata";
import "./globals.css";
export const metadata: Metadata = portfolioMetadata();
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/dm-serif-display-regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <script id="portfolio-welcome-state" dangerouslySetInnerHTML={{ __html: `(function(){var show=location.pathname==='/'&&location.hash!=='#work'&&!new URLSearchParams(location.search).has('window')&&!matchMedia('(prefers-reduced-motion: reduce)').matches;try{show=show&&!sessionStorage.getItem('portfolio-welcome-seen');}catch(e){}document.documentElement.dataset.portfolioWelcome=show?'show':'seen';})();` }} />
      </head>
      <body><DesktopBoundary>{children}</DesktopBoundary></body>
    </html>
  );
}
