import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

/**
 * Only `status: published` articles reach the public site and the production
 * build. `draft` and `reviewed` articles are visible in dev only.
 */
export function isPublic(status: Article['data']['status']): boolean {
  return status === 'published';
}

export async function getVisibleArticles(): Promise<Article[]> {
  const all = await getCollection('articles');
  const visible = import.meta.env.PROD ? all.filter((entry) => isPublic(entry.data.status)) : all;

  return visible.sort(
    (a, b) =>
      b.data.translation_date.getTime() - a.data.translation_date.getTime() ||
      a.data.title_ar.localeCompare(b.data.title_ar, 'ar'),
  );
}

/** Raw Markdown body of an article (the Syriac/Arabic pairs). */
export function articleBody(entry: Article): string {
  return entry.body ?? '';
}

/** `YYYY-MM-DD`, stable across locales and rendered as a machine-readable date. */
export function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}
