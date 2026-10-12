/**
 * Tatweel (kashida, U+0640) is a purely decorative stretching character that
 * word processors insert to justify lines. It is removed at build/render time.
 *
 * This is the ONLY permitted text transformation in the project.
 * Nothing else may alter Syriac or Arabic text: no Unicode normalization, no
 * diacritic removal, no "corrections". The text belongs to the translator.
 */

const TATWEEL = /\u0640/g;

export function stripTatweel(text: string): string {
  return text.replace(TATWEEL, '');
}
