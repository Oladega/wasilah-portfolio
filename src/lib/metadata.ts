import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wasilah-portfolio.vercel.app";
const defaultTitle = `${siteConfig.name} — Marketing, Events & Community`;
const defaultDescription = `${siteConfig.name}’s portfolio: marketing, social media, event planning, project coordination and community leadership. Based in Lagos, Nigeria.`;
const shareImage = {
  url: "/images/portfolio-share.jpg",
  width: 1672,
  height: 941,
  alt: `Soft floral background for ${siteConfig.name}’s portfolio`,
};

export function portfolioMetadata({
  title = defaultTitle,
  description = defaultDescription,
  path = "/",
}: { title?: string; description?: string; path?: string } = {}): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_NG",
      siteName: `${siteConfig.name} — Portfolio`,
      title,
      description,
      url: path,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@TheWasilah",
      title,
      description,
      images: [shareImage],
    },
  };
}
