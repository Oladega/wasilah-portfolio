import {chromium,firefox,webkit} from 'playwright';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const base=process.env.BASE_URL||'http://localhost:3003';const report=[];
for(const engine of (process.env.REVIEW_BROWSERS||'chrome').split(',')){
 const browser=await ({chrome:chromium,firefox,webkit}[engine]).launch({headless:true,...(engine==='chrome'?{executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));const shown=x=>x.filter({visible:true}).first();const ids=['about','work','resume','contact'],labels=['About Me','My Work','Résumé','Contact Me'];
 const settled=()=>page.waitForFunction(()=>!document.querySelector('[data-window-animation-shell]')&&![...document.querySelectorAll('[data-window-id]')].some(e=>e.dataset.windowTransition));
 const icons=page.getByRole('navigation',{name:'Portfolio',exact:true}).getByRole('button');
 for(const width of [1440,1280,1024,768,430,375]){
  await page.setViewportSize({width,height:932});await page.goto(base);
  for(let index=0;index<4;index++){
   await icons.nth(index).click();const dialog=page.locator(`[data-window-id=${ids[index]}]`);await dialog.waitFor();await settled();
   assert.equal(await page.getByRole('navigation',{name:'Application dock',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:/^Minimize /}).evaluateAll(es=>es.filter(e=>!e.disabled).length),0);
   assert.equal(await dialog.getAttribute('aria-modal'),String(width<810));const box=await dialog.boundingBox();assert.ok(box.x>=-1&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=933);
   const group=shown(dialog.getByRole('group',{name:`${labels[index]} window controls`,exact:true}));assert.equal(await group.locator('button').count(),3);
   const close=group.getByRole('button',{name:`Close ${labels[index]}`,exact:true});const closeBox=await close.boundingBox();assert.ok(Math.abs(closeBox.width-14)<.01);assert.ok(Math.abs(closeBox.height-14)<.01);
   if(width>=810){
    const green=group.getByRole('button',{name:`Maximize ${labels[index]}`,exact:true});const greenBox=await green.boundingBox();const yellow=group.getByRole('button',{name:'Minimize unavailable'});assert.ok(await yellow.isDisabled());const yellowBox=await yellow.boundingBox();assert.equal(Math.round(yellowBox.x-closeBox.x-closeBox.width),8);assert.equal(Math.round(greenBox.x-yellowBox.x-yellowBox.width),8);
    if(index===3)assert.ok(await green.isDisabled());else{for(let cycle=0;cycle<2;cycle++){await green.click();await settled();const max=await dialog.boundingBox();assert.ok(max.width>=box.width);await group.getByRole('button',{name:`Restore ${labels[index]}`,exact:true}).click();await settled();const restored=await dialog.boundingBox();assert.ok(Math.abs(restored.width-box.width)<1&&Math.abs(restored.x-box.x)<1);}}
   }else assert.equal(await dialog.getByRole('button',{name:/^(Maximize|Restore) /}).count(),0);
   if(index===2){await dialog.locator('[data-ready=true]').first().waitFor();const slider=dialog.getByRole('slider');await slider.focus();await slider.press('End');assert.equal(await slider.inputValue(),'200');await slider.press('Home');assert.equal(await slider.inputValue(),'50');}
   if(index===3)assert.equal(await dialog.getByRole('navigation',{name:'Contact options'}).getByRole('link').count(),3);
   await dialog.getByRole('button',{name:'Close',exact:true}).click();await dialog.waitFor({state:'hidden'});await settled();
   await icons.nth(index).click();await dialog.waitFor();await page.mouse.click(4,60);await dialog.waitFor({state:'hidden'});await settled();
  }
  report.push({engine,width,windows:4,controls:'pass',outsideClose:'pass'});
 }
 await page.setViewportSize({width:1440,height:932});await page.goto(base);
 for(let i=0;i<4;i++){await icons.nth(i).focus();await icons.nth(i).press('Enter');await page.locator(`[data-window-id=${ids[i]}]`).waitFor();}
 assert.equal(await page.getByRole('dialog').count(),4);
 // Closing a background application must not close or steal activation from another.
 await page.locator('[data-window-id=work]').getByRole('button',{name:'Close',exact:true}).evaluate(e=>e.click());await page.locator('[data-window-id=work]').waitFor({state:'hidden'});assert.equal(await page.getByRole('dialog').count(),3);
 await page.locator('[data-window-id=resume]').getByRole('button',{name:'Close',exact:true}).evaluate(e=>e.click());await page.locator('[data-window-id=resume]').waitFor({state:'hidden'});assert.equal(await page.getByRole('dialog').count(),2);
 await page.mouse.click(130,250);assert.equal(await page.locator('[data-window-id=about]').getAttribute('data-window-active'),'true');
 await page.locator('[data-window-id=contact]').focus();assert.equal(await page.locator('[data-window-id=contact]').getAttribute('data-window-active'),'true');
 await page.mouse.click(4,60);await page.locator('[data-window-id=contact]').waitFor({state:'hidden'});assert.equal(await page.getByRole('dialog').count(),1);assert.equal(await page.locator('[data-window-id=about]').getAttribute('data-window-active'),'true');
 await page.mouse.click(4,60);await page.getByRole('dialog').waitFor({state:'hidden'});
 // Drag only the normal desktop titlebar, and preserve that geometry across size changes.
 await icons.first().click();const about=page.locator('[data-window-id=about]');const normal=await about.boundingBox();await page.mouse.move(normal.x+normal.width-200,normal.y+30);await page.mouse.down();await page.mouse.move(normal.x+normal.width-150,normal.y+60,{steps:10});await page.mouse.up();await page.waitForTimeout(80);const dragged=await about.boundingBox();assert.ok(dragged.x>normal.x+30&&dragged.y>normal.y+15,JSON.stringify({normal,dragged}));
 await shown(about.getByRole('button',{name:'Maximize About Me',exact:true})).click();const max=await about.boundingBox();await page.mouse.move(max.x+max.width-200,max.y+30);await page.mouse.down();await page.mouse.move(max.x+max.width-150,max.y+60,{steps:5});await page.mouse.up();const after=await about.boundingBox();assert.ok(Math.abs(after.x-max.x)<1&&Math.abs(after.y-max.y)<1);
 await shown(about.getByRole('button',{name:'Restore About Me',exact:true})).click();const restored=await about.boundingBox();assert.ok(Math.abs(restored.x-dragged.x)<2&&Math.abs(restored.y-dragged.y)<2);
 await page.keyboard.press('Escape');await about.waitFor({state:'hidden'});
 // Open/close and outside-click exits must retain the real node until animation completion.
 await page.emulateMedia({reducedMotion:'no-preference'});await icons.first().click();await page.locator('[data-window-animation-shell=open]').waitFor();await page.mouse.click(4,60);await page.locator('[data-window-animation-shell=close]').waitFor();assert.equal(await about.count(),1);assert.equal(await about.evaluate(e=>getComputedStyle(e).opacity),'0');await settled();assert.equal(await about.count(),0);
 for(let i=0;i<3;i++){await icons.first().click();await page.locator('[data-window-animation-shell=open]').waitFor();await about.getByRole('button',{name:'Close',exact:true}).evaluate(e=>e.click());await settled();assert.equal(await about.count(),0);}
 await icons.first().click();await page.locator('[data-window-animation-shell=open]').waitFor();await page.setViewportSize({width:1024,height:800});await settled();await page.keyboard.press('Escape');await settled();
 await page.emulateMedia({reducedMotion:'reduce'});for(let i=0;i<3;i++){await icons.nth(i).focus();await icons.nth(i).press('Enter');}assert.equal(await page.getByRole('dialog').count(),3);await page.setViewportSize({width:375,height:850});await page.waitForFunction(()=>document.querySelectorAll('[data-window-id]').length===1);const mobile=page.getByRole('dialog');const m=await mobile.boundingBox();await page.mouse.move(m.x+m.width-100,m.y+25);await page.mouse.down();await page.mouse.move(m.x+m.width-70,m.y+60,{steps:5});await page.mouse.up();const ma=await mobile.boundingBox();assert.ok(Math.abs(ma.x-m.x)<1&&Math.abs(ma.y-m.y)<1);await page.keyboard.press('Escape');await mobile.waitFor({state:'hidden'});
 assert.deepEqual(errors,[]);assert.equal(await page.locator('[data-window-animation-shell],[data-window-visual-snapshot]').count(),0);await browser.close();console.log(engine,'passed cleanup, 24 viewport cases, multiwindow focus, isolated outside close, dragging, mobile, PDF and rapid exits');
}
await writeFile('docs/window-cleanup-results.json',JSON.stringify(report,null,2)+'\n');
