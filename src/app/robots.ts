import type {MetadataRoute} from 'next';import {absoluteUrl} from '@/lib/seo';
export const dynamic='force-static';
// Let crawlers read preview noindex metadata; blocking crawl can hide that directive.
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/'},sitemap:absoluteUrl('/sitemap.xml')};}
