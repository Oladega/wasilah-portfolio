import { chromium } from "playwright";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const b = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage();
const base = process.env.BASE_URL || "http://localhost:3000";
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const report = [];
for (const width of [1440, 1280, 1024, 768, 430, 375]) {
  await p.setViewportSize({ width, height: width < 500 ? 932 : 900 });
  await p.goto(base);
  await p.waitForTimeout(2100);
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
    `Overflow at ${width}`,
  );
  assert.match(await p.locator("time").last().innerText(), /^\d{2}:\d{2}$/);
  await p
    .getByRole("button", {
      name: width < 810 ? "About Me" : "About Wasilah",
      exact: true,
    })
    .click();
  await p.getByRole("dialog", { name: "About Wasilah" }).waitFor();
  await p.keyboard.press("Escape");
  await p.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(await p.getByRole("dialog").count(), 0);
  await p.getByRole("button", { name: "My Work", exact: true }).click();
  const work = p.getByRole("dialog", { name: "Work", exact: true });
  await work.waitFor();
  assert.equal(await work.locator('a[href^="/work/"]').count(), 5);
  await work
    .getByRole("button", {
      name: width < 810 ? "Events" : "Events & Conferences",
      exact: true,
    })
    .click();
  assert.equal(await work.locator('a[href^="/work/"]').count(), 3);
  await work
    .getByRole("button", {
      name: width < 810 ? "Leadership" : "Leadership",
      exact: true,
    })
    .click();
  assert.equal(await work.locator('a[href^="/work/"]').count(), 1);
  await work
    .getByRole("button", {
      name: width < 810 ? "All" : "All work",
      exact: true,
    })
    .click();
  await work.locator('a[href="/work/pulse"]').click();
  await p.waitForURL("**/work/pulse");
  await p
    .getByRole("heading", { name: "Final Year Week ’26", exact: true })
    .waitFor();
  await p.goto(base);
  await p
    .getByRole("button", {
      name: width < 810 ? "Contact me" : "Contact Me",
      exact: true,
    })
    .click();
  const contact = p.getByRole("dialog", { name: "Contact Me", exact: true });
  await contact.waitFor();
  assert.equal(await contact.getByRole("navigation", { name: "Contact options" }).getByRole("link").count(), 3);
  await p.keyboard.press("Escape");
  await p.getByRole("dialog").waitFor({ state: "hidden" });
  await p.getByRole("navigation", { name: "Portfolio", exact: true }).getByRole("button", { name: width < 810 ? "Résumé" : "Résumé.pdf", exact: true }).click();
  await p.getByRole("dialog", { name: "Résumé.pdf", exact: true }).waitFor();
  const download = p.waitForEvent("download");
  await p.getByRole("link", { name: "Download ↓", exact: true }).last().click();
  const file = await download;
  assert.match(file.suggestedFilename(), /Resume\.pdf$/);
  report.push({
    width,
    overflow: false,
    about: "pass",
    filters: "pass",
    projectNavigation: "pass",
    contactResume: "pass",
    download: "pass",
  });
}
await p.setViewportSize({ width: 1440, height: 900 });
for (const slug of ["pulse", "nacre", "kiln-co", "orbit"]) {
  const r = await p.goto(`${base}/work/${slug}`);
  assert.equal(r.status(), 200);
  await p.getByRole("button", { name: "Results", exact: true }).click();
  await p.waitForTimeout(700);
  assert.ok(
    await p
      .locator("#results")
      .evaluate((e) => e.getBoundingClientRect().y < 800),
  );
  assert.equal(
    await p
      .locator("article section")
      .last()
      .locator('a[href^="/work/"]')
      .count(),
    { pulse: 3, nacre: 3, "kiln-co": 3, orbit: 3 }[slug],
  );
  report.push({
    route: `/work/${slug}`,
    sectionScroll: "pass",
    relatedCards: "pass",
  });
}
await p.goto(base);
const sound = p.getByRole("button", {
  name: "Play background music",
  exact: true,
});
await sound.click();
await p
  .getByRole("button", { name: "Mute background music", exact: true })
  .waitFor();
await p
  .getByRole("button", { name: "Mute background music", exact: true })
  .click();
await p.emulateMedia({ reducedMotion: "reduce" });
await p.reload();
assert.equal(
  await p.locator('[class*="WelcomeAnimation_welcome"]').isVisible(),
  false,
);
assert.deepEqual(errors, []);
await writeFile(
  "docs/smoke-results.json",
  JSON.stringify(
    {
      checks: report,
      music: "pass",
      reducedMotion: "pass",
      runtimeErrors: errors,
    },
    null,
    2,
  ),
);
console.log(
  "Passed: six viewport layouts, modal close, filters, project routes, PDF download, music, reduced motion, console errors.",
);
await b.close();
