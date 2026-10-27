import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { staticAssetsAdapter } from "@vinext/cloudflare/cache/static-assets-adapter";
import { createHash } from "node:crypto";
import { patchCssModules } from "vite-css-modules";
import path from "node:path";

export default defineConfig({
  // Pin metadata at build time so prerendered pages and Worker metadata routes agree.
  define: Object.fromEntries(
    ["SITE_URL", "SITE_NOINDEX", "GOOGLE_SITE_VERIFICATION", "BING_SITE_VERIFICATION", "NEXT_PUBLIC_DISABLE_VERCEL_ANALYTICS"].map(key => [
      `process.env.${key}`, JSON.stringify(process.env[key] ?? ""),
    ]),
  ),
  plugins: [
    patchCssModules({ exportMode: "default" }),
    vinext({
      cache: { cdn: staticAssetsAdapter() },
      prerender: { routes: "*" },
    }),
    cloudflare({
      configPath: process.env.CLOUDFLARE_BUILD_TARGET === "production"
        ? "wrangler.production.jsonc" : "wrangler.jsonc",
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
  css: {
    modules: {
      generateScopedName(name: string, filename: string) {
        const relativePath = path.relative(import.meta.dirname, filename.replace(/\?.*$/, "")).replaceAll("\\", "/");
        return `_${name}_${createHash("sha256").update(relativePath).digest("hex").slice(0, 7)}`;
      },
    },
  },
});
