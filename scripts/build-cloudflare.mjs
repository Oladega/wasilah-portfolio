import {spawnSync} from 'node:child_process';
import {appendFile} from 'node:fs/promises';

// A staging-only build: no auth, upload, DNS, or deployment side effects.
const env = {
  ...process.env,
  SITE_URL: 'https://wasilah.online',
  SITE_NOINDEX: 'true',
  NEXT_PUBLIC_DISABLE_VERCEL_ANALYTICS: 'true',
};
for (const args of [['run', 'prebuild'], ['exec', 'vite', '--', 'build'], ['exec', 'next', '--', 'typegen']]) {
  const result = spawnSync('npm', args, {stdio: 'inherit', env});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
// Static Asset headers do not affect the existing Vercel output in out/.
await appendFile('dist/client/_headers', `
/*
  X-Robots-Tag: noindex
  X-Content-Type-Options: nosniff
/images/*
  Cache-Control: public, max-age=86400
/fonts/*
  Cache-Control: public, max-age=86400
/audio/*
  Cache-Control: public, max-age=86400
/pdfjs/*
  Cache-Control: public, max-age=86400
/documents/*
  Cache-Control: public, max-age=3600
`);
