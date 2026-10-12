import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePairs } from '../src/lib/parsePairs.ts';

const identity = (markdown: string): string => markdown;
const FILE = 'src/content/articles/example.md';

test('parses a normal body into pairs', () => {
  const body = 'ܐ.\n\nب.\n\n===\n\nܓ.\n\nد.';

  assert.deepEqual(parsePairs(body, { renderInline: identity }), [
    { syr: 'ܐ.', ar: 'ب.' },
    { syr: 'ܓ.', ar: 'د.' },
  ]);
});

test('ignores surrounding blank lines and trailing whitespace', () => {
  const body = '\n\n  ܐ.  \n\n  ب.  \n\n===\n\nܓ.\n\nد.\n\n';

  assert.deepEqual(parsePairs(body, { renderInline: identity }), [
    { syr: 'ܐ.', ar: 'ب.' },
    { syr: 'ܓ.', ar: 'د.' },
  ]);
});

test('accepts Windows line endings without touching the text', () => {
  const body = 'ܐ.\r\n\r\nب.\r\n\r\n===\r\n\r\nܓ.\r\n\r\nد.';

  assert.deepEqual(parsePairs(body, { renderInline: identity }), [
    { syr: 'ܐ.', ar: 'ب.' },
    { syr: 'ܓ.', ar: 'د.' },
  ]);
});

test('an empty body yields no pairs', () => {
  assert.deepEqual(parsePairs('', { renderInline: identity }), []);
  assert.deepEqual(parsePairs('   \n\n  ', { renderInline: identity }), []);
});

test('one paragraph in a pair fails the build with file, pair and count', () => {
  const body = 'ܐ.\n\nب.\n\n===\n\nܓ.';

  assert.throws(
    () => parsePairs(body, { file: FILE, renderInline: identity }),
    (error: Error) => {
      assert.match(error.message, /src\/content\/articles\/example\.md/);
      assert.match(error.message, /pair 2/);
      assert.match(error.message, /1 paragraph\b/);
      return true;
    },
  );
});

test('three paragraphs in a pair fails the build with the actual count', () => {
  const body = 'ܐ.\n\nب.\n\n===\n\nܓ.\n\nد.\n\nه.';

  assert.throws(
    () => parsePairs(body, { file: FILE, renderInline: identity }),
    (error: Error) => {
      assert.match(error.message, /pair 2/);
      assert.match(error.message, /3 paragraphs/);
      return true;
    },
  );
});

test('a missing separator makes the failure point at the offending pair', () => {
  const body = 'ܐ.\n\nب.\n\nܓ.\n\nد.';

  assert.throws(
    () => parsePairs(body, { file: FILE, renderInline: identity }),
    (error: Error) => {
      assert.match(error.message, /pair 1/);
      assert.match(error.message, /4 paragraphs/);
      return true;
    },
  );
});

test('a dangling separator is reported, not silently dropped', () => {
  const body = 'ܐ.\n\nب.\n\n===\n';

  assert.throws(
    () => parsePairs(body, { file: FILE, renderInline: identity }),
    (error: Error) => {
      assert.match(error.message, /pair 2/);
      return true;
    },
  );
});

test('strips tatweel from both the Syriac and the Arabic side', () => {
  const body = 'ܐ\u0640ܒ.\n\nب\u0640ج.';

  assert.deepEqual(parsePairs(body, { renderInline: identity }), [{ syr: 'ܐܒ.', ar: 'بج.' }]);
});

test('keeps diacritics byte-for-byte apart from U+0640', () => {
  const syriac = '\u0726\u0741\u0723\u071d\u0729\u072c\u0710';
  const arabic = '\u0627\u0644\u0652\u0641\u0650\u0642\u0652\u0631\u064e\u0629';
  const body = `${syriac}\u0640.\n\n${arabic}\u0640.`;

  const [pair] = parsePairs(body, { renderInline: identity });

  assert.equal(pair.syr, `${syriac}.`);
  assert.equal(pair.ar, `${arabic}.`);
  assert.deepEqual(
    [...Buffer.from(pair.ar, 'utf8')],
    [...Buffer.from(`${arabic}.`, 'utf8')],
  );
});

test('renders inline bold (speaker labels) by default', () => {
  const body = '**ܟܗܢܐ:** ܦܣܝܩܬܐ.\n\n**الكاهن:** الفقرة الثانية.';

  const [pair] = parsePairs(body);

  assert.equal(pair.syr, '<strong>ܟܗܢܐ:</strong> ܦܣܝܩܬܐ.');
  assert.equal(pair.ar, '<strong>الكاهن:</strong> الفقرة الثانية.');
});

test('renders inline italic by default', () => {
  const body = '*ܐ.*\n\n*ب.*';

  const [pair] = parsePairs(body);

  assert.equal(pair.syr, '<em>ܐ.</em>');
  assert.equal(pair.ar, '<em>ب.</em>');
});

test('never "smarts" punctuation: quotes, dashes and dots are not typographically transformed', () => {
  // Curly quotes, en/em dashes and ellipses would be a modification of the
  // translator's text. Straight quotes are HTML-escaped for display (&quot;),
  // which is safe; what must never appear is a "smartened" character.
  const raw = 'قال "كذا" و-- أيضاً... انتهى';
  const body = `${raw}\n\n${raw}`;

  const [pair] = parsePairs(body);

  for (const rendered of [pair.syr, pair.ar]) {
    assert.ok(!rendered.includes('\u2018') && !rendered.includes('\u2019'), 'curly single quote');
    assert.ok(!rendered.includes('\u201c') && !rendered.includes('\u201d'), 'curly double quote');
    assert.ok(!rendered.includes('&ldquo;') && !rendered.includes('&rdquo;'), 'curly quote entity');
    assert.ok(!rendered.includes('\u2013') && !rendered.includes('\u2014'), 'en/em dash');
    assert.ok(!rendered.includes('\u2026'), 'ellipsis');
    assert.ok(rendered.includes('--'), 'double hyphen preserved');
    assert.ok(rendered.includes('...'), 'three dots preserved');
    assert.ok(rendered.includes('&quot;') || rendered.includes('"'), 'straight quote preserved');
  }
});
