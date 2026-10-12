import type { APIRoute } from 'astro';
import { getVisibleArticles, isoDate } from '../lib/articles.ts';
import { absoluteUrl } from '../config/site.ts';

export const GET: APIRoute = async () => {
  const articles = await getVisibleArticles();

  const entries: { loc: string; lastmod?: string }[] = [
    { loc: absoluteUrl('/') },
    { loc: absoluteUrl('/about/') },
    ...articles.map((article) => ({
      loc: absoluteUrl(`/articles/${article.id}/`),
      lastmod: isoDate(article.data.translation_date),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) =>
      `  <url>\n    <loc>${entry.loc}</loc>${
        entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
      }\n  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
