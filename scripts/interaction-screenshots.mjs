import { chromium } from "playwright";
const b = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const [kind, url] of [
  ["reference", "https://informal-room-612303.framer.app"],
  ["implementation", process.env.BASE_URL || "http://localhost:3000"],
]) {
  await p.goto(url);
  await p.waitForTimeout(400);
  await p.screenshot({
    path: `docs/screenshots/${kind}/welcome-animation.png`,
  });
  await p.waitForTimeout(4000);
  if (kind === "reference") {
    await p.getByText("About Wasilah", { exact: true }).hover();
  } else {
    await p.getByRole("button", { name: "About Wasilah", exact: true }).hover();
  }
  await p.screenshot({ path: `docs/screenshots/${kind}/navigation-hover.png` });
  await (
    kind === "reference"
      ? p.getByText("My Work", { exact: true })
      : p.getByRole("button", { name: "My Work", exact: true })
  ).click();
  await p.waitForTimeout(800);
  await p.locator('a[href$="/work/halden"]').hover();
  await p.screenshot({
    path: `docs/screenshots/${kind}/project-card-hover.png`,
  });
}
await b.close();
