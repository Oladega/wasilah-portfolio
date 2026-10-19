// Set SITE_URL (or the existing NEXT_PUBLIC_SITE_URL) when moving to a custom domain.
const configured = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://wasilah-portfolio.vercel.app';
const parsed = new URL(configured);
if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('SITE_URL must be an absolute HTTP(S) URL');
export const siteUrl = parsed.origin;
export const absoluteUrl = (path = '/') => new URL(path, `${siteUrl}/`).href;
// Preview builds are noindex even though their canonical URLs point at production.
export const indexable = process.env.VERCEL_ENV !== 'preview' && process.env.SITE_NOINDEX !== 'true';
