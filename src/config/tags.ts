/**
 * Registry of article tags ("وسوم").
 *
 * This file is the single source of truth for a tag's Arabic label: article
 * frontmatter lists tag slugs only, and the label shown on the site is read
 * from here. Adding a tag is a one-line change to this file; using an unknown
 * slug in an article fails the build.
 *
 * The slug is Latin (URL-safe) and becomes the tag page: /tags/<slug>/
 */
export interface Tag {
  /** Arabic label, exactly as it should be shown on the site. */
  label_ar: string;
}

export const tags = {
  // The label below is a placeholder, kept from the sample article.
  sample: { label_ar: 'نموذج' },
  prayer: { label_ar: 'الصلاة' },
  fast: { label_ar: 'الصوم' },
  christmas: { label_ar: 'عيد الميلاد' },
  repentance: { label_ar: 'التوبة' },
} as const satisfies Record<string, Tag>;

export type TagSlug = keyof typeof tags;

export const tagSlugs = Object.keys(tags) as readonly TagSlug[];

const known = new Set<string>(tagSlugs);

export function isTagSlug(value: string): value is TagSlug {
  return known.has(value);
}

/** The tag registered for a slug, or `undefined` when the slug is unknown. */
export function getTag(slug: string): Tag | undefined {
  return isTagSlug(slug) ? tags[slug] : undefined;
}

/** Arabic label for a slug; falls back to the slug itself. */
export function tagLabel(slug: string): string {
  return getTag(slug)?.label_ar ?? slug;
}
