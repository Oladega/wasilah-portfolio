import type {MetadataRoute} from 'next';import {projects} from '@/data/projects';import {absoluteUrl,indexable} from '@/lib/seo';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{return indexable?['/','/about','/work','/resume','/contact',...projects.map(p=>`/work/${p.slug}`)].map(path=>({url:absoluteUrl(path)})):[];}
