import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base = process.env.BASE_URL || 'http://localhost:3001';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
await mkdir('docs/screenshots/welcome-update', { recursive: true });
for (const width of [1440, 375]) {
 const context = await browser.newContext({ viewport: { width, height: 932 } });
 const page = await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base, { waitUntil: 'domcontentloaded' });
 const loader=page.getByRole('status',{name:'Loading Wasilat Atilade’s portfolio',exact:true});
 await loader.waitFor({state:'visible'});
 const initial=await loader.evaluate(el=>{const s=getComputedStyle(el);return {opacity:s.opacity,color:s.backgroundColor,z:s.zIndex,delay:s.animationDelay,duration:s.animationDuration};});
 assert.deepEqual(initial,{opacity:'1',color:'rgb(73, 53, 68)',z:'200',delay:'2.2s',duration:'0.52s'});
 await page.waitForFunction(()=>{const el=document.querySelector('[role="status"]');const a=el?.getAnimations().find(a=>a.effect?.target===el);return a && a.currentTime>=1000;});
 assert.equal(await loader.evaluate(el=>getComputedStyle(el).opacity),'1');
 const spinner=loader.locator('span');const transform=await spinner.evaluate(el=>getComputedStyle(el).transform);await page.waitForTimeout(100);assert.notEqual(await spinner.evaluate(el=>getComputedStyle(el).transform),transform);
 await page.screenshot({path:`docs/screenshots/welcome-update/opaque-${width}.png`});
 await page.waitForFunction(()=>{const el=document.querySelector('[role="status"]');if(!el)return false;const opacity=+getComputedStyle(el).opacity;return opacity>0 && opacity<1;});
 await loader.waitFor({state:'detached'});
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('portfolio-welcome-seen')),'1');
 await page.getByRole('link',{name:'My Work',exact:true}).click();await page.getByRole('dialog',{name:'Work',exact:true}).locator('a[href="/work/pulse"]').click();await page.waitForURL('**/work/pulse');await page.getByRole('link',{name:'Works — Back to all work'}).click();await page.getByRole('dialog',{name:'Work',exact:true}).waitFor();assert.equal(await page.getByRole('status').count(),0);
 await page.reload();await page.waitForTimeout(150);assert.equal(await page.getByRole('status').count(),0);assert.deepEqual(errors,[]);
 await context.close();
}
for (const scenario of ['project','reduced-motion']) {
 const context=await browser.newContext(scenario==='reduced-motion'?{reducedMotion:'reduce'}:{});const page=await context.newPage();await page.goto(scenario==='project'?`${base}/work/pulse`:base);assert.equal(await page.getByRole('status').isVisible(),false);await context.close();
}
await browser.close();console.log('Verified opaque 2.2-second intro, smooth 520ms dissolve, continuous spinner, no repeat on navigation/reload, direct project entry and reduced-motion behavior.');
