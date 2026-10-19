import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base=process.env.BASE_URL||'http://localhost:3001';
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const shown=locator=>locator.filter({visible:true}).first();
const settled=()=>page.waitForFunction(()=>!document.querySelector('[data-window-animation-shell]')&&[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).every(e=>!e.dataset.windowTransition&&getComputedStyle(e).opacity==='1'));
const shell=kind=>page.locator(`[data-window-animation-shell="${kind}"]`);
const icons=page.getByRole('navigation',{name:'Portfolio',exact:true}).getByRole('link');
const labels=['About Me','My Work','Résumé','Contact Me'];
async function captureFrame(kind) {
 await page.evaluate(()=>[...document.querySelectorAll('[data-window-animation-shell],[data-window-transition]')].flatMap(e=>e.getAnimations()).forEach(a=>{a.pause();a.currentTime=Number(a.effect.getTiming().duration)*.5}));
 await page.screenshot({path:`docs/screenshots/window-motion/${kind}-0.5.png`});
 await page.evaluate(()=>[...document.querySelectorAll('[data-window-animation-shell],[data-window-transition]')].flatMap(e=>e.getAnimations()).forEach(a=>a.play()));
}

await mkdir('docs/screenshots/window-motion',{recursive:true});
await page.addInitScript(()=>document.addEventListener('click',event=>{
 const button=event.target.closest?.('nav[aria-label="Portfolio"] a');
 if(button) window.__launchRect=button.querySelector('img').getBoundingClientRect().toJSON();
},true));
for(const width of [1440,768,430]){
 await page.setViewportSize({width,height:932});await page.goto(base);await page.reload();
 await page.waitForFunction(()=>document.documentElement.dataset.portfolioWelcome==='seen');
 for(const [index,label] of labels.entries()){
  await icons.nth(index).click();await shell('open').waitFor();
  // Inspect the first FLIP keyframe: it must map exactly to the clicked live image rect.
  const mapping=await shell('open').evaluate(el=>{
   const frames=el.getAnimations().flatMap(a=>a.effect.getKeyframes());const first=frames.find(f=>f.transform);
   const matrix=new DOMMatrix(first.transform);return {x:parseFloat(el.style.left)+matrix.e,y:parseFloat(el.style.top)+matrix.f,width:parseFloat(el.style.width)*matrix.a,height:parseFloat(el.style.height)*matrix.d,source:window.__launchRect};
  });
  for(const key of ['x','y','width','height'])assert.ok(Math.abs(mapping[key]-mapping.source[key])<1.1,JSON.stringify(mapping));
  const dialog=page.getByRole('dialog');await settled();
  if(index!==3&&width>=810){
   await shown(dialog.getByRole('button',{name:`Maximize ${label}`,exact:true})).click();await shell('maximize').waitFor();if(index===0&&width===1440)await captureFrame('maximize');await settled();
   await shown(dialog.getByRole('button',{name:`Restore ${label}`,exact:true})).click();await shell('unmaximize').waitFor();if(index===0&&width===1440)await captureFrame('unmaximize');await settled();
  }
  await shown(dialog.getByRole('button',{name:`Close ${label}`,exact:true})).click();await shell('close').waitFor();if(index===0&&width===1440)await captureFrame('close');assert.equal(await dialog.count(),1);
  await settled();await dialog.waitFor({state:'hidden'});
 }
}
await page.setViewportSize({width:1440,height:932});
// Freeze real compositor frames for visual inspection, rather than photographing arbitrary timing.
await icons.first().click();await shell('open').waitFor();
const animationFrames=await page.evaluate(()=>[...document.querySelectorAll('[data-window-animation-shell],[data-window-transition]')].flatMap(e=>e.getAnimations()).map(a=>{a.pause();return 1}).length);assert.ok(animationFrames>=1);
for(const progress of [.1,.35,.65,.9]){
 await page.evaluate(progress=>[...document.querySelectorAll('[data-window-animation-shell],[data-window-transition]')].flatMap(e=>e.getAnimations()).forEach(a=>a.currentTime=Number(a.effect.getTiming().duration)*progress),progress);
 await page.screenshot({path:`docs/screenshots/window-motion/open-${progress}.png`});
}
await page.evaluate(()=>[...document.querySelectorAll('[data-window-animation-shell],[data-window-transition]')].flatMap(e=>e.getAnimations()).forEach(a=>a.play()));await settled();
// Close during entrance, resize during maximize, and simultaneous desktop openings.
await page.keyboard.press('Escape');await settled();
await icons.first().click();await shell('open').waitFor();await shown(page.getByRole('button',{name:'Close About Me',exact:true})).click({force:true});await settled();assert.equal(await page.getByRole('dialog').count(),0);
await icons.first().click();await settled();await shown(page.getByRole('button',{name:'Maximize About Me',exact:true})).click();await shell('maximize').waitFor();await page.setViewportSize({width:1100,height:800});await settled();
await shown(page.getByRole('button',{name:'Close About Me',exact:true})).click({force:true});await settled();assert.equal(await page.getByRole('dialog').count(),0);
await icons.evaluateAll(buttons=>buttons.forEach(button=>button.click()));await settled();await page.getByRole('dialog',{name:'Contact Me',exact:true}).waitFor();assert.equal(await page.getByRole('dialog').count(),4);await page.goto(base);await settled();
await page.goto(base+'/work/pulse');await settled();
await shown(page.getByRole('button',{name:'Close Final Year Week ’26',exact:true})).click();await shell('close').waitFor();
assert.ok(new URL(page.url()).pathname.includes('/work/pulse'));await settled();await page.waitForURL(base+'/');
assert.equal(await page.locator('[style*="will-change"]').count(),0);
await icons.first().click();await shell('open').waitFor();await page.emulateMedia({reducedMotion:'reduce'});await settled();await page.keyboard.press('Escape');
await page.emulateMedia({reducedMotion:'reduce'});await icons.first().click();assert.equal(await page.locator('[data-window-animation-shell]').count(),0);await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
// Missing browser animation API uses the immediate compatibility path.
const fallback=await browser.newPage({reducedMotion:'no-preference'});await fallback.addInitScript(()=>{Element.prototype.animate=undefined;});await fallback.goto(base+'/#work');await fallback.getByRole('dialog').waitFor();assert.equal(await fallback.locator('[data-window-animation-shell]').count(),0);
assert.deepEqual(errors,[]);await browser.close();
console.log('Passed exact icon FLIP geometry, all lifecycle animations at three viewport sizes, maximize/restore, interrupted transitions, resize, reduced motion, fallback, no leaked shells and frame captures.');
