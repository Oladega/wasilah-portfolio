import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
page.setDefaultNavigationTimeout(20000);
page.setDefaultTimeout(5000);
const dir = "docs/screenshots/reference";
await mkdir(dir, { recursive: true });
const assets = new Set();
const records = {};
page.on("response", (r) => {
  if (
    /framerusercontent.com\/images\/|fonts.gstatic.com|\.mp3|\.pdf/.test(
      r.url(),
    )
  )
    assets.add(r.url());
});
async function capture(name) {
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  records[name] = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    text: document.body.innerText,
    links: [...document.querySelectorAll("a")].map((a) => ({
      text: a.textContent,
      href: a.getAttribute("href"),
    })),
    images: [...document.images].map((i) => ({ src: i.src, alt: i.alt })),
    elements: [
      ...document.querySelectorAll(
        "[data-framer-name],h1,h2,h3,h2 span,h3 span",
      ),
    ]
      .filter((e) => e.getBoundingClientRect().width)
      .map((e) => {
        const s = getComputedStyle(e);
        return {
          name: e.getAttribute("data-framer-name"),
          class: e.className,
          text: e.textContent.slice(0, 250),
          rect: e.getBoundingClientRect().toJSON(),
          font: s.fontFamily,
          size: s.fontSize,
          line: s.lineHeight,
          letter: s.letterSpacing,
          color: s.color,
          background: s.background,
          padding: s.padding,
          gap: s.gap,
          border: s.border,
          borderRadius: s.borderRadius,
          filter: s.backdropFilter,
        };
      }),
  }));
  await writeFile(
    "docs/reference-measurements.json",
    JSON.stringify(records, null, 2),
  );
  await writeFile(
    "docs/reference-assets.json",
    JSON.stringify([...assets], null, 2),
  );
}
for (const width of [1440, 1280, 1024, 768, 430, 375]) {
  await page.setViewportSize({ width, height: width < 500 ? 932 : 900 });
  await page.goto("https://informal-room-612303.framer.app/");
  await capture(`home-${width}`);
  if ([1440, 768, 430, 375].includes(width)) {
    await page
      .getByText(width < 810 ? "About Me" : "About Wasilah", { exact: true })
      .click();
    await capture(`about-${width}`);
    await page.goto("https://informal-room-612303.framer.app/");
    await page.waitForTimeout(800);
    await page.getByText("My Work", { exact: true }).click();
    await capture(`work-${width}`);
    await page
      .getByText(width < 810 ? "Events" : "Events & Conferences", {
        exact: true,
      })
      .click({ timeout: 2000 })
      .catch(() => {});
    await capture(`work-filter-${width}`);
    await page.goto("https://informal-room-612303.framer.app/");
    await page.waitForTimeout(800);
    await page
      .getByText(width < 810 ? "Résumé" : "Résumé.pdf", { exact: true })
      .click();
    await capture(`resume-${width}`);
  }
}
for (const slug of ["halden", "pulse", "nacre", "kiln-co", "orbit"]) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`https://informal-room-612303.framer.app/work/${slug}`);
  await capture(`project-${slug}`);
  await page.getByText("Results", { exact: true }).first().click();
  await capture(`project-${slug}-results`);
  await page.setViewportSize({ width: 430, height: 932 });
  await page.reload();
  await capture(`project-${slug}-mobile`);
}
await writeFile(
  "docs/reference-measurements.json",
  JSON.stringify(records, null, 2),
);
await writeFile(
  "docs/reference-assets.json",
  JSON.stringify([...assets], null, 2),
);
await browser.close();
