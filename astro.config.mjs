import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { site } from './src/config/site.ts';

// The domain is defined ONCE, in src/config/site.ts, and read from there here.
// The only deploy-time override is the base path, which a sub-path host such as
// a GitHub Pages project site needs:
//   BASE_PATH=/meltho/ npm run build
// For a custom domain, edit `url` in src/config/site.ts (one place).
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: site.url,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  markdown: {
    // Hard rule: the article text belongs to the translator. Smart punctuation
    // (straight quotes -> curly quotes, -- -> en dash, ... -> ellipsis) is ON by
    // default in Astro, so it must stay explicitly off.
    processor: satteri({ features: { smartPunctuation: false } }),
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
