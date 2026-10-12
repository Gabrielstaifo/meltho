import { getFather, type Father } from '../config/fathers.ts';
import { getTag, type Tag } from '../config/tags.ts';

/**
 * The minimum an article must expose to be classified. Kept structural so the
 * grouping helpers can be unit-tested with plain objects, and still accept the
 * real `Article` entries.
 */
export interface ClassifiedArticle {
  data: {
    author_slug: string;
    tags: string[];
  };
}

export interface FatherGroup<T> {
  slug: string;
  father: Father;
  articles: T[];
}

export interface TagGroup<T> {
  slug: string;
  tag: Tag;
  articles: T[];
}

/**
 * Group articles by their father. Groups are sorted by the father's Arabic
 * name; unknown slugs are skipped (the content schema rejects them anyway).
 */
export function groupByFather<T extends ClassifiedArticle>(articles: readonly T[]): FatherGroup<T>[] {
  const bySlug = new Map<string, T[]>();

  for (const article of articles) {
    const slug = article.data.author_slug;
    const list = bySlug.get(slug);
    if (list) list.push(article);
    else bySlug.set(slug, [article]);
  }

  const groups: FatherGroup<T>[] = [];
  for (const [slug, list] of bySlug) {
    const father = getFather(slug);
    if (father) groups.push({ slug, father, articles: list });
  }

  return groups.sort((a, b) => a.father.name_ar.localeCompare(b.father.name_ar, 'ar'));
}

/**
 * Group articles by tag. An article with several tags appears in each of them.
 * Groups are sorted by article count (most used first), then by Arabic label.
 */
export function groupByTag<T extends ClassifiedArticle>(articles: readonly T[]): TagGroup<T>[] {
  const bySlug = new Map<string, T[]>();

  for (const article of articles) {
    for (const slug of article.data.tags) {
      const list = bySlug.get(slug);
      if (list) list.push(article);
      else bySlug.set(slug, [article]);
    }
  }

  const groups: TagGroup<T>[] = [];
  for (const [slug, list] of bySlug) {
    const tag = getTag(slug);
    if (tag) groups.push({ slug, tag, articles: list });
  }

  return groups.sort(
    (a, b) =>
      b.articles.length - a.articles.length || a.tag.label_ar.localeCompare(b.tag.label_ar, 'ar'),
  );
}
