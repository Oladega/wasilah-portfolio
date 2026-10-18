import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
const b = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
let out = {};
for (const route of ["/", "/work/halden"]) {
  await p.goto("https://informal-room-612303.framer.app" + route);
  await p.waitForTimeout(4000);
  out[route] = await p.evaluate(() => ({
    images: [...document.images].map((x) => ({
      src: x.currentSrc,
      alt: x.alt,
    })),
    ancestors: [
      ...document.querySelector("img").parentElement.parentElement.parentElement
        .children,
    ].map((e) => ({
      class: e.className,
      name: e.getAttribute("data-framer-name"),
      style: e.getAttribute("style"),
      background: getComputedStyle(e).background,
      filter: getComputedStyle(e).filter,
      opacity: getComputedStyle(e).opacity,
    })),
    text: [...document.querySelectorAll("h2,h3,p")]
      .filter((e) => e.getBoundingClientRect().width)
      .map((e) => ({
        text: e.textContent,
        font: getComputedStyle(e).fontFamily,
        size: getComputedStyle(e).fontSize,
        line: getComputedStyle(e).lineHeight,
        weight: getComputedStyle(e).fontWeight,
        r: e.getBoundingClientRect().toJSON(),
      })),
  }));
}
await writeFile("docs/extra-details.json", JSON.stringify(out, null, 2));
await b.close();
