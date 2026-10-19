import {chromium,firefox,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.BASE_URL||'http://localhost:3003';const results=[];
await mkdir('docs/screenshots/window-handoffs',{recursive:true});
for(const engine of (process.env.REVIEW_BROWSERS||'chrome').split(',')){
 const browser=await ({chrome:chromium,firefox,webkit}[engine]).launch({headless:true,...(engine==='chrome'?{executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,768,375]){
  await page.setViewportSize({width,height:932});await page.goto(base);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{
   window.visualLeaks=[];window.exitLeaks=[];
   new MutationObserver(records=>{for(const r of records)for(const el of r.removedNodes)if(el instanceof HTMLElement&&el.dataset.windowAnimationShell==='close'){
    const real=document.querySelector(`[data-window-id="${el.dataset.windowAnimationFor}"]`);
    if(real?.getClientRects().length&&getComputedStyle(real).opacity!=='0'&&!real.dataset.windowTransition)window.exitLeaks.push(el.dataset.windowAnimationShell);
   }}).observe(document.body,{subtree:true,childList:true});
   function inspect(){for(const shell of document.querySelectorAll('[data-window-animation-shell]')){
    const real=document.querySelector(`[data-window-id="${shell.dataset.windowAnimationFor}"]`);
    if(real?.getClientRects().length&&getComputedStyle(real).opacity!=='0')window.visualLeaks.push(shell.dataset.windowAnimationShell);
   }requestAnimationFrame(inspect);}requestAnimationFrame(inspect);
  });
  const settled=()=>page.waitForFunction(()=>!document.querySelector('[data-window-animation-shell]')&&![...document.querySelectorAll('[data-window-id]')].some(n=>n.dataset.windowTransition));
  async function frames(kind,label){
   const shell=page.locator(`[data-window-animation-shell="${kind}"]`);await shell.waitFor();
   await shell.evaluate(el=>el.getAnimations().forEach(a=>a.pause()));
   assert.equal(await page.getByRole('dialog').count(),1,'visual copy must not expose a second dialog');
   for(const progress of [0,.01,.5,.99]){
    await shell.evaluate((el,p)=>el.getAnimations().forEach(a=>a.currentTime=Number(a.effect.getTiming().duration)*p),progress);
    assert.equal(await page.locator('[data-window-id]').filter({visible:true}).first().evaluate(el=>getComputedStyle(el).opacity),'0');
    if(engine==='chrome'&&(width===1440||width===375))await page.screenshot({path:`docs/screenshots/window-handoffs/${width}-${label}-${kind}-${progress}.png`});
   }
   await shell.evaluate(el=>el.getAnimations().forEach(a=>a.play()));await settled();
  }
  for(const[index,label]of ['About Me','My Work','Résumé','Contact Me'].entries()){
   await page.getByRole('navigation',{name:'Portfolio',exact:true}).getByRole('button').nth(index).click();await frames('open',index);
   const shown=x=>x.filter({visible:true}).first();
   if(index===2)await page.locator('[data-ready=true]').first().waitFor();
   if(index!==3&&width>=810){await shown(page.getByRole('button',{name:`Maximize ${label}`,exact:true})).click();await frames('maximize',index);await shown(page.getByRole('button',{name:`Restore ${label}`,exact:true})).click();await frames('unmaximize',index);}
   await shown(page.getByRole('button',{name:`Close ${label}`,exact:true})).click();await frames('close',index);
  }
  const leaks=await page.evaluate(()=>({visual:window.visualLeaks,exit:window.exitLeaks}));assert.deepEqual(leaks,{visual:[],exit:[]});
  assert.equal(await page.locator('[data-window-animation-shell],[data-window-visual-snapshot],[style*="will-change"]').count(),0);
  results.push({engine,width,windows:4,ownershipLeaks:0,exitLeaks:0});
 }
 assert.deepEqual(errors,[]);await browser.close();
}
await writeFile('docs/window-flicker-results.json',JSON.stringify(results,null,2)+'\n');console.log('Passed single-owner frames at 0/1/50/99%, exit handoffs, inert copies, all lifecycle transitions and cleanup.',results);
