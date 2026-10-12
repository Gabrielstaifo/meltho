# AGENTS.md — Instructions for AI coding agents

**Project name: Meltho** (Syriac ܡܠܬܐ, "word"). The name is **provisional** and the owner plans to change it.

Read `PROJECT.md` (Arabic) first for goals, audience and context. This file says **how** to build and maintain the project. If the two ever disagree, ask the owner before choosing.

## 1. What you are building

A static, bilingual **Syriac | Arabic parallel-text website** that publishes Arabic translations of writings by Church Fathers (Syriac Orthodox tradition). Each article shows the Syriac original and the Arabic translation side by side, paragraph by paragraph. Readers mostly arrive from social media links on **mobile phones**.

A working visual prototype is in `prototype/parallel-text.html`. It is the design source of truth. Reproduce its look and behaviour; do not redesign it.

## 2. Hard rules (never break these)

1. **Never alter, "fix", translate, summarise or generate** Syriac or Arabic article text. The text is the translator's work. If you think something is wrong, report it; do not change it.
2. **Never apply Unicode normalization (NFC/NFD/NFKC/NFKD)** to Syriac or Arabic text. It can reorder diacritics and corrupt the text.
3. **Keep all diacritics** (Syriac points, Arabic tashkeel).
4. The only permitted text transformation is removing **tatweel (U+0640)** at build/render time. Do it in code (a helper in `src/lib/`), never by editing the source `.md` files.
5. **Do not invent content**, placeholder articles aside (mark those clearly as `status: draft` and obviously fake).
6. **Do not add dependencies, services, analytics, trackers, or remote assets** without asking. No CDN fonts in production; self-host.
7. **Do not add a backend, database, user accounts, or comments.** The site is fully static.
8. **Never hard-code the project name, tagline or domain.** Define them once in `src/config/site.ts` (`name`, `tagline_ar`, `tagline_en`, `url`) and read them everywhere (titles, header, footer, OG tags, About page, package name excluded). Renaming the project must be a one-file change.
9. Ask before making decisions listed under "Open decisions" in `PROJECT.md`.

## 3. Tech stack

- **Astro** (static output), **TypeScript** (strict)
- **Markdown** content via Astro **Content Collections** with a Zod schema
- Plain **CSS** with custom properties (no Tailwind, no UI framework)
- **marked** (or equivalent) only for inline Markdown inside paragraphs (`**bold**`, `*italic*`)
- Fonts self-hosted in `public/fonts/`: **Amiri** (Arabic), **Noto Sans Syriac** (Syriac). Provide `font-display: swap` and sensible fallbacks. Check whether *Noto Sans Syriac Western* (Serto style) is available under an open licence; if so, propose it to the owner rather than switching silently.
- Node LTS, npm
- Hosting target: static host (GitHub Pages, Netlify or Cloudflare Pages). Keep the build host-agnostic; make `site`/`base` configurable in `astro.config.mjs`.

## 4. Commands

Set these up in `package.json` and keep them working:

```
npm install
npm run dev        # local dev server
npm run build      # production build (must also run content validation)
npm run preview    # serve the built site
npm run check      # astro check + type check
```

A broken build must fail loudly with a clear message (see §6 validation).

## 5. Repository structure

```
.
├── AGENTS.md
├── PROJECT.md
├── package.json
├── tsconfig.json
├── astro.config.mjs
├── public/
│   ├── fonts/                   # self-hosted Amiri + Noto Sans Syriac (woff2)
│   ├── favicon.svg
│   └── og-default.png           # default social preview, 1200x630
├── scripts/                     # helpers run by hand, not part of the build
│   ├── fetch-fonts.mjs          # re-downloads the fonts, regenerates src/styles/fonts.css
│   ├── og-image.html            # source for the social preview image
│   └── build-og-image.mjs       # renders public/og-default.png
├── test/                        # unit tests for parsePairs and stripTatweel
├── prototype/parallel-text.html # design reference (§7 is the written equivalent)
└── src/
    ├── config/site.ts             # project name, taglines, URL (single source)
    ├── content.config.ts          # collection schema
    ├── content/articles/*.md      # one file per article
    ├── components/                # PairRow, ArticleCard, MetaFooter, ...
    ├── layouts/                   # Base.astro (head, OG tags), Article.astro
    ├── lib/                       # parsePairs, stripTatweel, articles helpers
    ├── pages/                     # index, articles/[...id], about, 404, sitemap.xml, robots.txt
    └── styles/                    # global.css (tokens + layout), fonts.css (generated)
```

## 6. Content format and validation

Each article is one Markdown file in `src/content/articles/<slug>.md`.

### Frontmatter schema (Zod)

| Field | Type | Required |
|---|---|---|
| `title_ar` | string | yes |
| `title_syr` | string | no |
| `author` | string (Father's name) | yes |
| `work` | string (original work) | yes |
| `source` | string (edition/manuscript/URL) | yes |
| `translator` | string | yes |
| `translation_date` | date | yes |
| `reviewer` | string | no |
| `status` | `draft` \| `reviewed` \| `published` | yes |
| `tags` | string[] | no (default `[]`) |
| `summary_ar` | string | yes |

Only `status: published` articles appear on the public index and in the production build; `draft` and `reviewed` are visible in dev only.

### Body format

The body is a list of **pairs** separated by a line containing only `===`. Each pair has **exactly two paragraphs separated by a blank line**: the **Syriac first**, then the **Arabic**.

```markdown
ܦܣܝܩܬܐ ܣܘܪܝܝܬܐ.

الفقرة العربية المقابلة.

===

**ܟܗܢܐ:** ܦܣܝܩܬܐ ܬܪܝܢܝܬܐ.

**الكاهن:** الفقرة العربية الثانية.
```

### `parsePairs(body)` requirements

- Split on `\n===\n`, trim, then split each block into paragraphs on blank lines.
- If a block does not contain exactly 2 paragraphs, **fail the build** with: file path, pair number (1-based), and the actual paragraph count.
- Apply `stripTatweel` to both texts, render inline Markdown, return `{ syr, ar }[]`.
- Write unit tests for: normal case, wrong paragraph count, tatweel removal, diacritics preserved byte-for-byte (apart from U+0640), inline bold.

## 7. Design specification (from the prototype)

### Tokens

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#faf6ee` | `#1b1713` |
| `--fg` | `#2b2118` | `#eee4d3` |
| `--mute` | `#8a7a68` | `#a39784` |
| `--line` | `#e2d6c2` | `#3a3128` |
| `--acc` | `#8c2f1f` | `#d9825f` |
| `--card` | `#fffdf8` | `#221d17` |

Theming: define tokens on `:root`; redefine under `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])`; redefine again for `:root[data-theme="dark"]`. Always set an explicit `body` background.

### Layout

- Page: `<html lang="ar" dir="rtl">`. Content max-width **1000px**, centered, side padding ~1.1rem.
- Each pair is a **row**: CSS grid, two equal columns, gap ~1.2rem. Because the page is RTL, the **Syriac column is first (right)** and the Arabic is second (left).
- Each cell is a **card**: `--card` background, 1px `--line` border, radius 10px, padding ~.9rem 1.1rem.
- Column headings ("السريانية" / "العربية") shown above the first row of a section on wide screens only.
- **Breakpoint at 720px:** single column, Syriac above Arabic, tight gap, hide column headings, and give the Syriac card an inline-start border (3px, `--acc`).
- Section headings: `--acc` colour, bottom border `--line`.
- Metadata footer at the end of each article: translator, source, date (and reviewer if present), muted colour, centered.
- Mobile safe areas: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `padding-top/bottom: env(safe-area-inset-*, 0px)` on `:root`, and `scroll-padding-top` on `html`.

### Typography

- Arabic: `Amiri`, fallback `'Noto Naskh Arabic', serif`; ~1.3rem; `text-align: justify`; line-height ~2.
- Syriac: `'Noto Sans Syriac'`, fallback `'Estrangelo Edessa', 'Serto Jerusalem', sans-serif`; ~1.2rem; `text-align: right`; line-height ~2.1.
- Speaker labels such as **الكاهن:** / **ܟܗܢܐ:** are bold with `--acc`.

## 8. Language and RTL rules

- Every Syriac block: `lang="syr" dir="rtl"`. Every Arabic block: `lang="ar"`.
- Both languages are RTL, but if a third language is added later, give each block its own `lang` and `dir`.
- Test with real Syriac text that includes combining marks (e.g. the prototype's sample passages); check marks are not detached or overlapping in the chosen font.
- Never use `letter-spacing` on Arabic or Syriac (it breaks letter joining).

## 9. Sharing and SEO

Articles are shared on social media, so each page needs:

- Unique `<title>` and meta description (from `summary_ar`).
- Open Graph and Twitter Card tags (`og:title`, `og:description`, `og:type=article`, `og:url`, `og:image`, `og:locale=ar`).
- A default `og:image` in `public/` (simple, text-based, matching the palette). Per-article images are a later enhancement.
- Canonical URL, sitemap, `robots.txt`.

## 10. Accessibility and performance

- Semantic HTML (`main`, `article`, `section`, headings in order).
- Contrast ≥ WCAG AA in both themes.
- Sizes in `rem`; allow user zoom; no fixed-height text containers.
- Zero or near-zero client JavaScript. Do not add a JS framework island unless a feature truly needs it.
- Subset or preload fonts so the first paint is fast on mobile networks.
- Target Lighthouse ≥ 95 for Performance, Accessibility and SEO on a representative article.

## 11. Print

Add a basic print stylesheet: hide navigation, keep pairs together (`break-inside: avoid`), switch to a light palette, keep both columns. This prepares for the later "download as PDF" feature.

## 12. Definition of done (per task)

- [ ] `npm run build` and `npm run check` pass
- [ ] Tests for `parsePairs` and `stripTatweel` pass
- [ ] Works at 360px, 720px and 1280px widths, light and dark
- [ ] Syriac and Arabic render correctly (diacritics intact)
- [ ] No new dependency or remote request added without approval
- [ ] No source article text was modified

## 13. Suggested build order

1. Scaffold Astro + TypeScript, `global.css` with tokens, `Base.astro`.
2. Self-host fonts; confirm rendering against the prototype.
3. `content.config.ts` schema; `parsePairs` + tests.
4. Port the prototype's two passages into a first article file (`status: published`) so the page can be compared 1:1 with the prototype.
5. `Article.astro` + `PairRow` + metadata footer.
6. Index page and "About" page.
7. OG tags, sitemap, robots, favicon.
8. Print stylesheet, accessibility and Lighthouse pass.
9. Deployment config for the chosen host.

## 14. How to work with the owner

- The owner (translator) is not necessarily a front-end specialist; explain choices briefly, in plain language, and offer Arabic summaries if asked.
- Work in small steps; commit often with clear messages.
- When you are unsure about content, design, or an "Open decision", **stop and ask**.
- Report anything suspicious in the source text (typos, mismatched pairs) instead of fixing it.