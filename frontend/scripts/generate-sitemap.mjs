import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const siteUrl = (process.env.VITE_SITE_URL || 'http://localhost:5173').trim().replace(/\/+$/, '');
const apiUrl = (process.env.VITE_API_URL || 'http://localhost:3000/api').trim().replace(/\/+$/, '');
const sitemapPath = resolve('public/sitemap.xml');
const robotsPath = resolve('public/robots.txt');

const urls = new Set([
  `${siteUrl}/`,
  `${siteUrl}/categories`,
]);

try {
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(`${apiUrl}/contents?page=${page}&limit=100`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    for (const content of payload.data || []) {
      if (content?.id) {
        urls.add(`${siteUrl}/content/${encodeURIComponent(content.id)}`);
      }
    }

    totalPages = Number(payload.pagination?.totalPages) || 1;
    page += 1;
  }
} catch (error) {
  console.warn(`Sitemap content fetch skipped: ${error instanceof Error ? error.message : String(error)}`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls]
  .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
  .join('\n')}\n</urlset>\n`;

const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /history\nDisallow: /login\nDisallow: /register\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

await mkdir(dirname(sitemapPath), { recursive: true });
await writeFile(sitemapPath, xml, 'utf8');
await writeFile(robotsPath, robots, 'utf8');
console.log(`Generated sitemap with ${urls.size} URLs for ${siteUrl}`);

function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character]);
}
