import { marked } from 'marked';
import { stripTatweel } from './stripTatweel.ts';

export interface Pair {
  /** Syriac paragraph, inline Markdown rendered to HTML, tatweel removed. */
  syr: string;
  /** Arabic paragraph, inline Markdown rendered to HTML, tatweel removed. */
  ar: string;
}

export interface ParsePairsOptions {
  /** Path shown in error messages (usually the article file). */
  file?: string;
  /** Inline Markdown renderer. Defaults to marked's inline parser. */
  renderInline?: (markdown: string) => string;
}

/**
 * A line containing only `===` separates one pair from the next.
 * `\r?\n` also accepts files saved with Windows line endings; the body itself
 * is never rewritten, so the article text stays byte-for-byte as authored.
 */
const PAIR_SEPARATOR = /\r?\n===\r?\n/;

/** Paragraphs inside a pair are separated by a blank line. */
const PARAGRAPH_SEPARATOR = /\r?\n[ \t]*\r?\n/;

function defaultRenderInline(markdown: string): string {
  return marked.parseInline(markdown, { async: false });
}

function fail(file: string, pairNumber: number, paragraphCount: number): never {
  throw new Error(
    `Cannot build ${file}: pair ${pairNumber} has ${paragraphCount} ` +
      `paragraph${paragraphCount === 1 ? '' : 's'}, but exactly 2 are required ` +
      `(Syriac first, then Arabic). Separate the two paragraphs with a blank line ` +
      `and separate pairs with a line containing only "===".`,
  );
}

/**
 * Turn an article body into an ordered list of Syriac/Arabic pairs.
 *
 * Every block must contain exactly two paragraphs: the Syriac first, then the
 * Arabic. Anything else fails the build loudly, so a lost paragraph can never
 * silently break the parallel alignment.
 */
export function parsePairs(body: string, options: ParsePairsOptions = {}): Pair[] {
  const { file = '<unknown>', renderInline = defaultRenderInline } = options;

  if (body.trim() === '') return [];

  const blocks = body.split(PAIR_SEPARATOR);

  return blocks.map((block, index) => {
    const pairNumber = index + 1;

    const paragraphs = block
      .split(PARAGRAPH_SEPARATOR)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);

    if (paragraphs.length !== 2) {
      fail(file, pairNumber, paragraphs.length);
    }

    const [syr, ar] = paragraphs as [string, string];

    return {
      syr: renderInline(stripTatweel(syr)),
      ar: renderInline(stripTatweel(ar)),
    };
  });
}
