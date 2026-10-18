import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
const b = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage();
let out = {};
for (const width of [1440, 1280, 1024, 768, 430, 375]) {
  await p.setViewportSize({ width, height: 900 });
  await p.goto("https://informal-room-612303.framer.app/", {
    waitUntil: "domcontentloaded",
  });
  await p.waitForTimeout(1500);
  out[width] = await p.evaluate(() =>
    [
      ...document.querySelectorAll(
        '[data-framer-name="Studio Status"],[data-framer-name="Greeting"],[data-framer-name="Desktop Icons"],h2,h3,h2 span,h3 span',
      ),
    ]
      .filter((e) => e.getBoundingClientRect().width)
      .map((e) => {
        let s = getComputedStyle(e);
        return {
          name: e.getAttribute("data-framer-name"),
          text: e.textContent,
          rect: e.getBoundingClientRect().toJSON(),
          font: s.fontFamily,
          size: s.fontSize,
          line: s.lineHeight,
          letter: s.letterSpacing,
          color: s.color,
          background: s.backgroundColor,
          border: s.border,
          filter: s.backdropFilter,
        };
      }),
  );
}
await writeFile("docs/home-measurements.json", JSON.stringify(out, null, 2));
await b.close();
