export const dynamic = 'force-dynamic';

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const urls = [
    '/',
    '/services',
    '/about',
    '/blog',
    '/faq',
    '/contact',
    '/login',
    '/register',
  ];
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map((p) => `\n  <url><loc>${base}${p}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`)
      .join('') +
    `\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

