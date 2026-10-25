import {projects} from '@/data/projects';

export const canonicalProjectSlugs = projects.map(project => project.slug);
export const projectOrderStorageKey = `portfolio-project-order:v1:${canonicalProjectSlugs.join(',')}`;

// This head script sets CSS order before the body paints. React hydrates the original
// server markup, then adopts the same order without changing its visual placement.
export const projectOrderBootstrap = `(function(){
var ids=${JSON.stringify(canonicalProjectSlugs)},key=${JSON.stringify(projectOrderStorageKey)},order;
try {
  order=JSON.parse(sessionStorage.getItem(key)||'null');
  if(!Array.isArray(order)||order.length!==ids.length||new Set(order).size!==ids.length||!order.every(function(id){return ids.indexOf(id)!==-1;})||order[ids.length-1]!==ids[ids.length-1]){
    order=ids.slice();
    var count=Math.min(4,Math.max(0,ids.length-1));
    for(var i=count-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),value=order[i];order[i]=order[j];order[j]=value;}
    sessionStorage.setItem(key,JSON.stringify(order));
  }
} catch(e){order=ids.slice();}
window.__portfolioProjectOrder=order;
order.forEach(function(id,index){document.documentElement.style.setProperty('--project-order-'+id,String(index));});
})();`;

export function projectOrderStyle(slug: string) {
  return {order: `var(--project-order-${slug}, ${canonicalProjectSlugs.indexOf(slug)})`};
}
