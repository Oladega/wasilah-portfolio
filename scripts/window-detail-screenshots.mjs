import { chromium } from "playwright";
const b = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage();
for (const [kind, url] of [
  ["reference", "https://informal-room-612303.framer.app"],
  ["implementation", process.env.BASE_URL || "http://localhost:3000"],
]) {
  await p.setViewportSize({ width: 430, height: 932 });
  await p.goto(url);
  await p.waitForTimeout(3000);
  await p.getByText("About Me", { exact: true }).click();
  await p.waitForTimeout(500);
  await p.mouse.move(300, 650);
  await p.mouse.wheel(0, 600);
  await p.waitForTimeout(1000);
  await p.screenshot({
    path: `docs/screenshots/${kind}/about-mobile-scroll.png`,
  });
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto(url);
  await p.waitForTimeout(3000);
  await p.getByText("Résumé.pdf", { exact: true }).click();
  if (kind === "reference") {
    await p.waitForFunction(
      () => [...document.querySelectorAll("canvas")].some((c) => c.width > 100),
      { timeout: 20000 },
    );
    await p.mouse.click(345, 375);
  } else {
    await p.getByRole("button", { name: "Go to page 2", exact: true }).click();
  }
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `docs/screenshots/${kind}/resume-page-2.png` });
}
await b.close();
console.log("Captured About scroll and second résumé page.");
