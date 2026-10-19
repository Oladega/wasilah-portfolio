import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const destination = resolve('public/pdfjs');
await mkdir(destination, {recursive:true});
await cp(resolve('node_modules/pdfjs-dist/LICENSE'), resolve(destination,'LICENSE.txt'));
await cp(resolve('node_modules/pdfjs-dist/build/pdf.worker.min.mjs'), resolve(destination,'pdf.worker.min.mjs'));
for (const directory of ['cmaps','standard_fonts','wasm','iccs']) {
  await cp(resolve('node_modules/pdfjs-dist',directory), resolve(destination,directory), {recursive:true});
}
