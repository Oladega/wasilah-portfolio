import {professionalProfile as profile,contacts} from '@/data/profile';
import {siteConfig} from '@/data/site';
import type {Project} from '@/types/project';
import {absoluteUrl} from './seo';
export function structuredData(path:string,title:string,type='WebPage',project?:Project){
 const personId=absoluteUrl('/#person');
 const person={'@type':'Person','@id':personId,name:profile.name,alternateName:profile.alternateNames,description:profile.description,url:absoluteUrl('/'),sameAs:contacts.filter(c=>c.href.startsWith('https:')).map(c=>c.href),alumniOf:{'@type':'CollegeOrUniversity',name:'University of Lagos'},knowsAbout:siteConfig.about.capabilities.map(c=>c.title),award:siteConfig.about.awards.flatMap(group=>group.items.map(a=>`${a.title} (${group.year})`))};
 const page={'@type':type,'@id':absoluteUrl(path+'#webpage'),url:absoluteUrl(path),name:title,isPartOf:{'@id':absoluteUrl('/#website')},about:{'@id':personId},...(type==='ProfilePage'?{mainEntity:{'@id':personId}}:{}),...(project?{mainEntity:{'@id':absoluteUrl(path+'#project')}}:{})};
 const breadcrumb={'@type':'BreadcrumbList',itemListElement:[{ '@type':'ListItem',position:1,name:'Home',item:absoluteUrl('/')},...(path.startsWith('/work/')?[{'@type':'ListItem',position:2,name:'Work',item:absoluteUrl('/work')}]:[]),...(path!=='/'?[{'@type':'ListItem',position:path.startsWith('/work/')?3:2,name:title,item:absoluteUrl(path)}]:[])]};
 return {'@context':'https://schema.org','@graph':[person,{'@type':'WebSite','@id':absoluteUrl('/#website'),name:'Wasilat Atilade Portfolio',url:absoluteUrl('/'),inLanguage:'en',publisher:{'@id':personId}},page,...(path!=='/'?[breadcrumb]:[]),...(project?[{'@type':'CreativeWork','@id':absoluteUrl(path+'#project'),name:project.title,description:project.description,url:absoluteUrl(path),author:{'@id':personId},image:project.photos.map(p=>absoluteUrl(p.src)),...(project.year?{temporalCoverage:project.year}:{})}]:[])]};
}
