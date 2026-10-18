import { chromium } from "playwright";
const b = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage();
for (const width of [1440, 1280, 1024, 768, 430, 375]) {
  await p.setViewportSize({ width, height: width < 500 ? 932 : 900 });
  await p.goto("https://informal-room-612303.framer.app/");
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(6000);
  await p.mouse.move(0, 0);
  await p.screenshot({ path: `docs/screenshots/reference/home-${width}.png` });
}
await b.close();
