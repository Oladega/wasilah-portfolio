import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const base=process.env.BASE_URL||'http://localhost:3003';
const page=await browser.newPage({reducedMotion:'reduce',deviceScaleFactor:2});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const shown=x=>x.filter({visible:true}).first();
const hash=createHash('sha256').update(await readFile('public/documents/qVI4VexACDjeL2UOQF9oibjSXo.pdf')).digest('hex');assert.equal(hash,'0553a0b61815d4bfb6cc0f00105826a9d2bd8593ff53751eac7c0791f59ceb41');
async function setZoom(value){await page.getByRole('slider',{name:'Document zoom',exact:true}).evaluate((el,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));},value);await page.waitForFunction(value=>document.querySelector('input[type=range]')?.value===String(value)&&document.querySelector('output')?.textContent===`${value}%`,value);}
async function ready(){await page.waitForFunction(()=>[...document.querySelectorAll('[aria-label="Résumé document"] [data-resume-page]')].some(page=>{const surface=page.querySelector('[data-ready=true]');return surface&&Math.abs(Number(surface.dataset.renderWidth)-page.getBoundingClientRect().width)<1;}));}
function focal(root){const viewport=root.getBoundingClientRect(),center=viewport.top+root.clientHeight/2;const pages=[...root.querySelectorAll('[data-resume-page]')];const target=pages.reduce((best,page)=>{const r=page.getBoundingClientRect(),b=best?.getBoundingClientRect();return !b||Math.abs(r.top+r.height/2-center)<Math.abs(b.top+b.height/2-center)?page:best;},null);const r=target.getBoundingClientRect();return {page:Number(target.dataset.resumePage),y:(center-r.top)/r.height,scrollTop:root.scrollTop};}
for(const width of [1440,1024,768,430,320]){
 await page.setViewportSize({width,height:1000});await page.goto(base);
 const nav=page.getByRole('navigation',{name:'Portfolio',exact:true});await nav.getByRole('link').nth(2).click();
 const dialog=page.getByRole('dialog',{name:'Résumé.pdf',exact:true});await dialog.waitFor();
 const viewer=dialog.getByRole('region',{name:'Résumé document',exact:true});
 await ready();assert.equal(await page.getByRole('slider',{name:'Document zoom',exact:true}).inputValue(),'115');
 const frame=await dialog.boundingBox(),header=await dialog.locator('header').boundingBox(),background=await page.locator('main > picture img').boundingBox();
 const initial=await viewer.evaluate(root=>({scroll:root.scrollWidth,width:root.clientWidth}));assert.ok(initial.scroll<=initial.width+2);
 let reference;
 for(const zoom of [50,75,100,115,150,200]){
  await setZoom(zoom);await ready();
  const measured=await viewer.locator('[data-resume-page]').first().boundingBox();
  reference??=measured.width/zoom;assert.ok(Math.abs(measured.width/zoom-reference)<.05);
  const current=await dialog.boundingBox();for(const key of ['width','height','x','y'])assert.ok(Math.abs(current[key]-frame[key])<.5);
  assert.deepEqual(await dialog.locator('header').boundingBox(),header);assert.deepEqual(await page.locator('main > picture img').boundingBox(),background);
  assert.ok(await dialog.locator('footer[aria-label="Document zoom controls"]').isVisible());
 }
 assert.ok(await page.getByRole('button',{name:'Zoom in',exact:true}).isDisabled());
 await page.getByRole('button',{name:'Zoom out',exact:true}).focus();await page.keyboard.press('Tab');assert.equal(await page.getByRole('slider',{name:'Document zoom',exact:true}).evaluate(el=>el===document.activeElement),true);
 await setZoom(50);assert.ok(await page.getByRole('button',{name:'Zoom out',exact:true}).isDisabled());
 const slider=page.getByRole('slider',{name:'Document zoom',exact:true});await slider.focus();await page.keyboard.press('ArrowRight');assert.equal(await slider.inputValue(),'55');
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();assert.equal(await slider.inputValue(),'60');await page.getByRole('button',{name:'Zoom out',exact:true}).click();assert.equal(await slider.inputValue(),'55');
 await setZoom(150);await ready();
 await viewer.evaluate(root=>{const second=root.querySelector('[data-resume-page="2"]');root.scrollTop+=second.getBoundingClientRect().top-root.getBoundingClientRect().top+second.getBoundingClientRect().height*.25-root.clientHeight/2;});
 await page.waitForTimeout(50);const before=await viewer.evaluate(focal);assert.equal(before.page,2);
 await setZoom(200);await ready();const after=await viewer.evaluate(focal);assert.equal(after.page,2);assert.ok(Math.abs(before.y-after.y)<.035,JSON.stringify({before,after}));
 const buffers=await viewer.locator('canvas').evaluateAll(items=>items.map(canvas=>({pixels:canvas.width*canvas.height,width:canvas.width,css:canvas.getBoundingClientRect().width})));assert.ok(buffers.every(canvas=>canvas.pixels<=8_020_000&&canvas.width>=canvas.css));
 if(width>=810){
 await shown(dialog.getByRole('button',{name:'Maximize Résumé',exact:true})).click();await ready();assert.equal(await slider.inputValue(),'200');
 await shown(dialog.getByRole('button',{name:'Restore Résumé',exact:true})).click();await ready();
 }
 await setZoom(115);await ready();
 if(width===1440||width===430)await page.screenshot({path:`/tmp/resume-zoom-${width}.png`});
 await shown(dialog.getByRole('button',{name:'Close Résumé',exact:true})).click();await nav.getByRole('link').nth(2).click();await ready();assert.equal(await slider.inputValue(),'115');
 const download=page.waitForEvent('download');await shown(dialog.getByRole('link',{name:'Download ↓',exact:true})).click();assert.equal((await download).suggestedFilename(),'Wasilat-Atilade-Resume.pdf');
 await page.keyboard.press('Escape');
}
// Download remains available on load failure; retry recovers the original document.
await page.context().route('**/documents/qVI4VexACDjeL2UOQF9oibjSXo.pdf',route=>route.fulfill({status:503,body:'Temporarily unavailable'}));
await page.getByRole('navigation',{name:'Portfolio',exact:true}).getByRole('link').nth(2).click();await page.getByRole('dialog').getByRole('alert').waitFor();
await page.context().unroute('**/documents/qVI4VexACDjeL2UOQF9oibjSXo.pdf');await page.getByRole('button',{name:'Try again',exact:true}).click();await ready();
assert.deepEqual(errors,[]);await browser.close();console.log('Passed exact PDF hash, 50/75/100/115/150/200% zoom, crisp bounded rendering, document-only scaling, focal preservation, multipage scrolling, keyboard, download, error/retry and window lifecycle across five layouts.');
