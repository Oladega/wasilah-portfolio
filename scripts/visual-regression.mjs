import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);
const base = process.env.BASE_URL || "http://localhost:3000";
const results = [];
const dir = "docs/screenshots";
for (const x of ["implementation", "comparisons"])
  await mkdir(`${dir}/${x}`, { recursive: true });
async function capture(name) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2000);
  const file = `${dir}/implementation/${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  const ref = `${dir}/reference/${name}.png`;
  try {
    const meta = await sharp(ref).metadata();
    const local = await sharp(file)
      .resize(meta.width, meta.height, { fit: "fill" })
      .ensureAlpha()
      .raw()
      .toBuffer();
    const orig = await sharp(ref).ensureAlpha().raw().toBuffer();
    let total = 0,
      changed = 0;
    const diff = Buffer.alloc(orig.length);
    for (let i = 0; i < orig.length; i += 4) {
      let max = 0;
      for (let j = 0; j < 3; j++) {
        const d = Math.abs(orig[i + j] - local[i + j]);
        total += d;
        max = Math.max(max, d);
        diff[i + j] = d;
      }
      diff[i + 3] = 255;
      if (max > 20) changed++;
    }
    await sharp({
      create: {
        width: meta.width * 2,
        height: meta.height,
        channels: 4,
        background: "#0d142a",
      },
    })
      .composite([
        { input: ref, left: 0, top: 0 },
        {
          input: await sharp(file).resize(meta.width, meta.height).toBuffer(),
          left: meta.width,
          top: 0,
        },
      ])
      .png()
      .toFile(`${dir}/comparisons/${name}-side-by-side.png`);
    await sharp(diff, {
      raw: { width: meta.width, height: meta.height, channels: 4 },
    })
      .png()
      .toFile(`${dir}/comparisons/${name}-diff.png`);
    results.push({
      name,
      meanChannelDifference: +(total / (meta.width * meta.height * 3)).toFixed(
        2,
      ),
      changedPixelsPercent: +(
        (100 * changed) /
        (meta.width * meta.height)
      ).toFixed(2),
    });
  } catch (e) {
    results.push({ name, error: String(e) });
  }
}
for (const width of [1440, 1280, 1024, 768, 430, 375]) {
  await page.setViewportSize({ width, height: width < 500 ? 932 : 900 });
  await page.goto(base);
  await capture(`home-${width}`);
  if ([1440, 768, 430, 375].includes(width)) {
    await page
      .getByRole("button", {
        name: width < 810 ? "About Me" : "About Wasilah",
        exact: true,
      })
      .click();
    await capture(`about-${width}`);
    await page
      .getByRole("button", { name: "Close window", exact: true })
      .first()
      .click();
    await page.getByRole("button", { name: "My Work", exact: true }).click();
    await capture(`work-${width}`);
    await page
      .getByRole("button", {
        name: width < 810 ? "Events" : "Events & Conferences",
        exact: true,
      })
      .click();
    await capture(`work-filter-${width}`);
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page
      .getByRole("button", {
        name: width < 810 ? "Résumé" : "Résumé.pdf",
        exact: true,
      })
      .click();
    await capture(`resume-${width}`);
  }
}
for (const slug of ["halden", "pulse", "nacre", "kiln-co", "orbit"]) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/work/${slug}`);
  await capture(`project-${slug}`);
  await page.getByRole("button", { name: "Results", exact: true }).click();
  await capture(`project-${slug}-results`);
  await page.setViewportSize({ width: 430, height: 932 });
  await page.reload();
  await capture(`project-${slug}-mobile`);
}
await writeFile(
  "docs/visual-comparison.json",
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
await browser.close();
