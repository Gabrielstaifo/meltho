/**
 * Registry of the Church Fathers whose writings appear on the site.
 *
 * This file is the single source of truth for a father's Arabic name: article
 * frontmatter refers to a father by `author_slug` only, and the name shown on
 * the site is read from here. Adding a father is a one-line change to this
 * file; using an unknown slug in an article fails the build.
 *
 * The slug is Latin (URL-safe) and becomes the category page: /fathers/<slug>/
 */
export interface Father {
  /** Arabic display name, exactly as it should be shown on the site. */
  name_ar: string;
  /** Optional Arabic dates, e.g. "٣٠٦–٣٧٣م". Shown on the father's page. */
  dates_ar?: string;
  /** Optional short Arabic note about the father. Shown on the father's page. */
  bio_ar?: string;
}

export const fathers = {
  // Placeholder entry for the sample article — replace with a real father.
  sample: {
    name_ar: 'اسم الأب (نموذج)',
  },
  ephrem: {
    name_ar: 'مار أفرام',
  },
  philoxenus: {
    name_ar: 'مار فيلكسينوس المنبجي',
  },
  severus: {
    name_ar: 'مار سويريوس الكبير',
  },
  'jacob-serugh': {
    name_ar: 'مار يعقوب السروجي',
  },
} as const satisfies Record<string, Father>;

export type FatherSlug = keyof typeof fathers;

export const fatherSlugs = Object.keys(fathers) as readonly FatherSlug[];

const known = new Set<string>(fatherSlugs);

export function isFatherSlug(value: string): value is FatherSlug {
  return known.has(value);
}

/** The father registered for a slug, or `undefined` when the slug is unknown. */
export function getFather(slug: string): Father | undefined {
  return isFatherSlug(slug) ? fathers[slug] : undefined;
}

/** Arabic display name for a slug; falls back to the slug itself. */
export function fatherName(slug: string): string {
  return getFather(slug)?.name_ar ?? slug;
}
