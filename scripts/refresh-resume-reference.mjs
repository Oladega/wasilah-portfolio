import { chromium } from "playwright";
const b = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage();
for (const width of [1440, 768, 430, 375]) {
  await p.setViewportSize({ width, height: width < 500 ? 932 : 900 });
  await p.goto("https://informal-room-612303.framer.app/");
  await p.waitForTimeout(3500);
  await p
    .getByText(width < 810 ? "Résumé" : "Résumé.pdf", { exact: true })
    .click();
  await p
    .waitForFunction(
      () => [...document.querySelectorAll("canvas")].some((c) => c.width > 100),
      { timeout: 20000 },
    )
    .catch(() => console.log("PDF canvas not ready at", width));
  await p.waitForTimeout(1000);
  await p.mouse.move(0, 0);
  await p.screenshot({
    path: `docs/screenshots/reference/resume-${width}.png`,
  });
}
await b.close();
