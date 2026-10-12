import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { fatherSlugs } from './config/fathers.ts';
import { tagSlugs } from './config/tags.ts';

const knownFatherSlugs: readonly string[] = fatherSlugs;
const knownTagSlugs: readonly string[] = tagSlugs;

/**
 * `author_slug` must be a key of `src/config/fathers.ts`. An unknown value
 * fails the build with the offending file, so a typo never ships silently.
 */
const authorSlug = z
  .string()
  .refine((value) => knownFatherSlugs.includes(value), {
    message: `unknown author_slug. Known fathers: ${knownFatherSlugs.join(', ')}. Add a new one to src/config/fathers.ts first.`,
  });

/**
 * Each tag must be a key of `src/config/tags.ts`, so every tag has exactly one
 * Arabic label and a working /tags/<slug>/ page.
 */
const tagSlug = z.string().refine((value) => knownTagSlugs.includes(value), {
  message: `unknown tag. Known tags: ${knownTagSlugs.join(', ')}. Add a new one to src/config/tags.ts first.`,
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title_ar: z.string(),
    title_syr: z.string(),
    author_slug: authorSlug,
    work: z.string(),
    source: z.string(),
    translator: z.string(),
    translation_date: z.coerce.date(),
    reviewer: z.string().optional(),
    status: z.enum(['draft', 'reviewed', 'published']),
    tags: z.array(tagSlug).default([]),
    summary_ar: z.string(),
  }),
});

export const collections = { articles };
