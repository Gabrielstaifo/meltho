import { defineConfig } from 'astro/config';
import { site } from './src/config/site.ts';

// Host-agnostic: override with SITE_URL / BASE_PATH at build time.
// Example for a GitHub Pages project site:
//   SITE_URL=https://user.github.io BASE_PATH=/meltho/ npm run build
const siteUrl = process.env.SITE_URL ?? site.url;
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: siteUrl,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  markdown: {
    // Never let Markdown "smarten" punctuation — article text is the translator's.
    smartypants: false,
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
