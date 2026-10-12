import test from 'node:test';
import assert from 'node:assert/strict';
import { stripTatweel } from '../src/lib/stripTatweel.ts';

const TATWEEL = '\u0640';

/** Arabic "الفقرة" with full tashkeel. */
const ARABIC_WITH_TASHKEEL =
  '\u0627\u0644\u0652\u0641\u0650\u0642\u0652\u0631\u064e\u0629';

/** Syriac "ܦܣܝܩܬܐ" with a qushshaya point (U+0741) after the first letter. */
const SYRIAC_WITH_POINTS =
  '\u0726\u0741\u0723\u071d\u0729\u072c\u0710';

function codePoints(value: string): string {
  return [...value].map((char) => char.codePointAt(0)!.toString(16)).join(' ');
}

test('removes tatweel (U+0640)', () => {
  assert.equal(stripTatweel(`م${TATWEEL}${TATWEEL}ل${TATWEEL}ثو`), 'ملثو');
});

test('leaves text without tatweel untouched', () => {
  const text = 'الفقرة العربية المقابلة';
  assert.equal(stripTatweel(text), text);
});

test('empty string stays empty', () => {
  assert.equal(stripTatweel(''), '');
});

test('an all-tatweel string becomes empty', () => {
  assert.equal(stripTatweel(TATWEEL.repeat(5)), '');
});

test('preserves Arabic tashkeel byte-for-byte', () => {
  const result = stripTatweel(ARABIC_WITH_TASHKEEL);
  assert.equal(result, ARABIC_WITH_TASHKEEL);
  assert.equal(codePoints(result), codePoints(ARABIC_WITH_TASHKEEL));
  assert.deepEqual([...Buffer.from(result, 'utf8')], [...Buffer.from(ARABIC_WITH_TASHKEEL, 'utf8')]);
});

test('preserves Syriac combining points byte-for-byte', () => {
  const result = stripTatweel(SYRIAC_WITH_POINTS);
  assert.equal(result, SYRIAC_WITH_POINTS);
  assert.equal(codePoints(result), codePoints(SYRIAC_WITH_POINTS));
  assert.deepEqual([...Buffer.from(result, 'utf8')], [...Buffer.from(SYRIAC_WITH_POINTS, 'utf8')]);
});

test('does not normalize: a decomposed sequence stays decomposed', () => {
  // ALEF + HAMZA ABOVE (NFD) must not be composed into U+0623.
  const decomposed = '\u0627\u0654';
  const result = stripTatweel(decomposed);
  assert.equal(result, decomposed);
  assert.equal(result.codePointAt(0), 0x0627);
  assert.equal(result.codePointAt(1), 0x0654);
});

test('only U+0640 differs between input and output', () => {
  const input = `${ARABIC_WITH_TASHKEEL}${TATWEEL} ${SYRIAC_WITH_POINTS}${TATWEEL}`;
  const expected = `${ARABIC_WITH_TASHKEEL} ${SYRIAC_WITH_POINTS}`;

  assert.equal(stripTatweel(input), expected);
  assert.deepEqual(
    [...Buffer.from(stripTatweel(input), 'utf8')],
    [...Buffer.from(expected, 'utf8')],
  );
});
