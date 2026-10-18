import { chromium } from "playwright";
import sharp from "sharp";
const b = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage();
for (const slug of ["halden", "pulse", "nacre", "kiln-co", "orbit"]) {
  for (const [kind, url] of [
    ["reference", "https://informal-room-612303.framer.app"],
    ["implementation", process.env.BASE_URL || "http://localhost:3000"],
  ]) {
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.goto(`${url}/work/${slug}`);
    await p.waitForTimeout(1500);
    for (const section of ["Challenge", "Identity"]) {
      await p.getByText(section, { exact: true }).first().click();
      await p.mouse.move(0, 0);
      await p.waitForTimeout(900);
      await p.screenshot({
        path: `docs/screenshots/${kind}/${slug}-${section.toLowerCase()}.png`,
      });
    }
    await p.setViewportSize({ width: 430, height: 932 });
    await p.reload();
    await p.waitForTimeout(1500);
    await p.mouse.move(300, 650);
    for (const n of [1, 2]) {
      await p.mouse.wheel(0, 600);
      await p.waitForTimeout(900);
      await p.screenshot({
        path: `docs/screenshots/${kind}/${slug}-mobile-scroll-${n}.png`,
      });
    }
  }
  for (const name of [
    "challenge",
    "identity",
    "mobile-scroll-1",
    "mobile-scroll-2",
  ]) {
    const file = `${slug}-${name}.png`;
    const a = `docs/screenshots/reference/${file}`;
    const c = `docs/screenshots/implementation/${file}`;
    const m = await sharp(a).metadata();
    await sharp({
      create: {
        width: m.width * 2,
        height: m.height,
        channels: 4,
        background: "#0d142a",
      },
    })
      .composite([
        { input: a, left: 0, top: 0 },
        { input: c, left: m.width, top: 0 },
      ])
      .png()
      .toFile(`docs/screenshots/comparisons/${slug}-${name}-side-by-side.png`);
  }
}
await b.close();
console.log(
  "Captured challenge, identity, and mobile scroll sections for all five project pages.",
);
