import type { Metadata } from 'next';
import { professionalProfile as profile } from '@/data/profile';
import { absoluteUrl, siteUrl, indexable } from './seo';
export function portfolioMetadata({title = 'Wasilat Atilade | Marketing, Events & Communications Portfolio',description = 'Explore the portfolio of Wasilat Atilade, a marketing and communications professional with experience in social media management, event planning, campaign coordination and community engagement.',path = '/',image}: {title?:string;description?:string;path?:string;image?:string} = {}): Metadata {
  const images = [{url:absoluteUrl(image ?? `/og/${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}.png`),width:1200,height:630,alt:`${title} — portfolio of Wasilat Atilade`}];
  return {metadataBase:new URL(siteUrl),icons:{icon:'/favicon.svg',shortcut:'/favicon.ico'},title,description,authors:[{name:profile.name}],creator:profile.name,
    alternates:{canonical:absoluteUrl(path)},robots:{index:indexable,follow:true},
    verification:{google:process.env.GOOGLE_SITE_VERIFICATION || 'Nu5oB2wb20Lr5yVdcCC6kMCiCDqbAJG4IWaU_GylHR0',other:process.env.BING_SITE_VERIFICATION?{'msvalidate.01':process.env.BING_SITE_VERIFICATION}:undefined},
    openGraph:{type:'website',locale:'en_NG',siteName:'Wasilat Atilade — Portfolio',title,description,url:absoluteUrl(path),images},
    twitter:{card:'summary_large_image',creator:'@TheWasilah',title,description,images},
  };
}
