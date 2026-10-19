import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
const base=process.env.BASE_URL||'http://localhost:3003';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const directory='docs/screenshots/final-review';await mkdir(directory,{recursive:true});
const labels=['About Me','My Work','Résumé','Contact Me'];
const shown=x=>x.filter({visible:true}).first();
async function ready(page){await page.waitForFunction(()=>!document.querySelector('[data-window-animation-shell]')&&[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).every(e=>!e.dataset.windowTransition&&getComputedStyle(e).opacity==='1'));}
async function warm(page){
 const icons=page.getByRole('navigation',{name:'Portfolio',exact:true}).getByRole('button');
 for(let i=0;i<4;i++){await icons.nth(i).click();await page.getByRole('dialog').waitFor();await ready(page);if(i===2)await page.locator('[data-ready=true]').first().waitFor();await page.keyboard.press('Escape');await ready(page);}
}
const results={hardware:{cpu:os.cpus()[0]?.model,cores:os.cpus().length,arch:process.arch,platform:process.platform,memoryGiB:Math.round(os.totalmem()/1024**3)},browser:browser.version(),mode:'headless, production static export',profiles:[]};
for(const profile of [{name:'desktop-native',width:1440,height:900,rate:1},{name:'mobile-native',width:430,height:932,rate:1},{name:'mobile-cpu4x',width:430,height:932,rate:4}]){
 const page=await browser.newPage({viewport:{width:profile.width,height:profile.height},reducedMotion:'no-preference'});
 await page.goto(base+'/#work');await page.getByRole('dialog').waitFor();await ready(page);await page.keyboard.press('Escape');await ready(page);await warm(page);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.rate});await cdp.send('HeapProfiler.collectGarbage');
 const before=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
 await page.evaluate(()=>{
  window.__windowProfile={intervals:[],longTasks:[],phases:[]};const stats=window.__windowProfile;const active=new Set();let last=0,previous=false;
  const observer=new MutationObserver(records=>{for(const record of records){for(const node of record.addedNodes){if(node.nodeType===1&&node.dataset.windowAnimationShell){active.add(node);node.__start=performance.now();}}for(const node of record.removedNodes){if(active.has(node)){active.delete(node);stats.phases.push({kind:node.dataset.windowAnimationShell,start:node.__start,end:performance.now()});}}}});
  observer.observe(document.body,{subtree:true,childList:true});
  let handle;const tick=now=>{if(active.size&&previous&&last)stats.intervals.push(now-last);last=now;previous=!!active.size;handle=requestAnimationFrame(tick);};handle=requestAnimationFrame(tick);
  let tasks;try{tasks=new PerformanceObserver(list=>stats.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration}))));tasks.observe({type:'longtask',buffered:false});}catch{}
  window.__stopWindowProfile=()=>{observer.disconnect();tasks?.disconnect();cancelAnimationFrame(handle);};performance.mark('portfolio-review:begin');
 });
 await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,toplevel,blink.user_timing',transferMode:'ReturnAsStream'});
 const icons=page.getByRole('navigation',{name:'Portfolio',exact:true}).getByRole('button');
 for(let cycle=0;cycle<2;cycle++)for(const [index,label]of labels.entries()){
  await icons.nth(index).click();await page.getByRole('dialog').waitFor();await ready(page);
  if(index===2)await page.locator('[data-ready=true]').first().waitFor();
  if(index!==3&&profile.width>=810){await shown(page.getByRole('button',{name:`Maximize ${label}`,exact:true})).click();await ready(page);await shown(page.getByRole('button',{name:`Restore ${label}`,exact:true})).click();await ready(page);}
  await shown(page.getByRole('button',{name:`Close ${label}`,exact:true})).click();await ready(page);
 }
 await page.evaluate(()=>{performance.mark('portfolio-review:end');window.__stopWindowProfile();});
 const stats=await page.evaluate(()=>window.__windowProfile);await page.waitForTimeout(300);await cdp.send('HeapProfiler.collectGarbage');const after=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
 const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const {stream}=await complete;let trace='';
 while(true){const chunk=await cdp.send('IO.read',{handle:stream});trace+=chunk.base64Encoded?Buffer.from(chunk.data,'base64').toString():chunk.data;if(chunk.eof)break;}await cdp.send('IO.close',{handle:stream});
 const filename=`${directory}/${profile.name}.trace.json`;await writeFile(filename,trace);
 const events=JSON.parse(trace).traceEvents;const main=events.find(e=>e.name==='thread_name'&&e.args?.name==='CrRendererMain');const durations=events.filter(e=>e.ph==='X'&&e.tid===main?.tid&&e.pid===main?.pid&&e.name==='RunTask').map(e=>(e.dur||0)/1000);
 const intervals=stats.intervals.sort((a,b)=>a-b);const percentile=q=>intervals[Math.min(intervals.length-1,Math.floor(intervals.length*q))]||0;
 const overlapTasks=stats.longTasks.filter(task=>stats.phases.some(phase=>task.start<phase.end&&task.start+task.duration>phase.start));
 const result={...profile,animations:stats.phases.length,frameSamples:intervals.length,medianRafMs:+percentile(.5).toFixed(2),p95RafMs:+percentile(.95).toFixed(2),rafFpsProxy:+(1000/(intervals.reduce((a,b)=>a+b,0)/Math.max(1,intervals.length))).toFixed(1),gapsOver25ms:intervals.filter(n=>n>25).length,longTasksDuringAnimations:overlapTasks.map(t=>+t.duration.toFixed(1)),maxRendererTaskMs:+Math.max(0,...durations).toFixed(1),layouts:after.LayoutCount-before.LayoutCount,styleRecalculations:after.RecalcStyleCount-before.RecalcStyleCount,layoutMs:+((after.LayoutDuration-before.LayoutDuration)*1000).toFixed(2),scriptMs:+((after.ScriptDuration-before.ScriptDuration)*1000).toFixed(2),heapDeltaBytes:after.JSHeapUsedSize-before.JSHeapUsedSize,nodeDelta:after.Nodes-before.Nodes,listenerDelta:after.JSEventListeners-before.JSEventListeners,trace:filename};
 results.profiles.push(result);console.log(JSON.stringify(result));await page.close();
}
await browser.close();await writeFile('docs/window-performance-results.json',JSON.stringify(results,null,2)+'\n');
