import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title_ar: z.string(),
    title_syr: z.string(),
    author: z.string(),
    work: z.string(),
    source: z.string(),
    translator: z.string(),
    translation_date: z.coerce.date(),
    reviewer: z.string().optional(),
    status: z.enum(['draft', 'reviewed', 'published']),
    tags: z.array(z.string()).default([]),
    summary_ar: z.string(),
  }),
});

export const collections = { articles };
