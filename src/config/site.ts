/**
 * Single source of truth for the project's identity.
 *
 * Hard rule: the project name, taglines and domain are never hard-coded
 * anywhere else. Renaming the project must be a one-file change (this file).
 */
export const site = {
  /** Provisional name; the owner is still choosing the final one. */
  name: 'Meltho',
  /** Syriac spelling of the name, shown next to it in the header. */
  name_syr: 'ܡܠܬܐ',
  tagline_ar:
    'ترجمات عربية لكتابات آباء الكنيسة السريانية، يُعرض فيها النص السرياني والترجمة العربية فقرة مقابل فقرة.',
  tagline_en: 'Arabic translations of Syriac Church Fathers, paragraph by paragraph.',
  /** Provisional domain; change here when the final domain is chosen. */
  url: 'https://example.com',
  locale: 'ar',
} as const;

/** Canonical paths, kept in one place so navigation stays consistent. */
export const paths = {
  home: '/',
  about: '/about/',
} as const;

/**
 * Prefix an internal path with Astro's configured `base`, so the same build
 * works at a domain root or under a sub-path (e.g. GitHub Pages project sites).
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/** Absolute URL for canonical links, Open Graph tags, the sitemap and robots.txt. */
export function absoluteUrl(path: string): string {
  return new URL(withBase(path), site.url).href;
}
