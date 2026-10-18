import sharp from "sharp";
import { readFile, writeFile, readdir } from "node:fs/promises";
const manifest = JSON.parse(await readFile("docs/asset-manifest.json", "utf8"));
let variants = {};
for (const filename of await readdir("public/images")) {
  if (
    filename.startsWith("wallpaper") ||
    filename.includes("-512") ||
    filename.includes("-1024")
  )
    continue;
  const src = `/images/${filename}`;
  const m = await sharp(`public${src}`).metadata();
  if (m.width <= 512) continue;
  let sets = [];
  for (const width of [512, 1024]) {
    if (width >= m.width) continue;
    const path = `/images/${filename.replace(".png", `-${width}.png`)}`;
    const url = `https://framerusercontent.com/images/${filename}?scale-down-to=${width}&width=${m.width}&height=${m.height}`;
    try {
      await readFile(`public${path}`);
    } catch {
      const response = await fetch(url);
      if (!response.ok) throw Error(`Asset ${response.status}: ${url}`);
      await writeFile(
        `public${path}`,
        Buffer.from(await response.arrayBuffer()),
      );
    }
    manifest[url] = path;
    sets.push(`${path} ${width}w`);
  }
  sets.push(`${src} ${m.width}w`);
  variants[src] = sets.join(", ");
}
await writeFile(
  "src/data/image-variants.ts",
  "// Original Framer-served responsive variants. Regenerate with scripts/download-image-variants.mjs.\nexport const imageVariants: Record<string, string> = " +
    JSON.stringify(variants, null, 2) +
    ";\n",
);
await writeFile("docs/asset-manifest.json", JSON.stringify(manifest, null, 2));
console.log(
  "Downloaded responsive variants for",
  Object.keys(variants).length,
  "images",
);
