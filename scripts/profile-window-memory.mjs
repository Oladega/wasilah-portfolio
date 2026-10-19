import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({reducedMotion:'reduce'});await page.goto(process.env.BASE_URL||'http://localhost:3003');
const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');const samples=[];
for(let cycle=0;cycle<7;cycle++){
 await page.getByRole('navigation',{name:'Portfolio',exact:true}).getByRole('link').nth(2).click();await page.locator('[data-ready=true]').first().waitFor();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.waitForTimeout(200);await cdp.send('HeapProfiler.collectGarbage');const metrics=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));samples.push({cycle,nodes:metrics.Nodes,listeners:metrics.JSEventListeners,heapBytes:metrics.JSHeapUsedSize});
}
await browser.close();await writeFile('docs/window-memory-results.json',JSON.stringify({note:'Forced-GC snapshots after full resume sessions; warming caches can retain heap. Not proof of absence of all leaks.',samples},null,2)+'\n');console.log(samples);
