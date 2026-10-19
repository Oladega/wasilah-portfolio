import http from "node:http";
import {gzip as gzipCallback} from "node:zlib";
import {promisify} from "node:util";
const gzip = promisify(gzipCallback);
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("out");
const port = Number(process.env.PORT || 3000);
const types = {
  ".xml": "application/xml; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      let file = resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403).end();
        return;
      }
      let info = await stat(file).catch(() => null);
      if (info?.isDirectory()) {
        const index = resolve(file, "index.html");
        file = await stat(index)
          .then(() => index)
          .catch(() => file + ".html");
      } else if (!info && !extname(file)) file += ".html";
      let data = await readFile(file);
      const compressed = /\b(?:gzip)\b/.test(req.headers["accept-encoding"] || "") && [".html", ".css", ".js", ".mjs", ".json", ".xml", ".txt", ".ttf"].includes(extname(file));
      if (compressed) data = await gzip(data);
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Vary": "Accept-Encoding",
        ...(compressed ? {"Content-Encoding": "gzip"} : {}),
        "Cache-Control": pathname.startsWith("/_next/static/") ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(
        await readFile(resolve(root, "404.html")).catch(() =>
          Buffer.from("Not found"),
        ),
      );
    }
  })
  .listen(port, () =>
    console.log(`Portfolio available at http://localhost:${port}`),
  );
