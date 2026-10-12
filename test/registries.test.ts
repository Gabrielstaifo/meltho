import test from 'node:test';
import assert from 'node:assert/strict';
import { fathers, fatherSlugs } from '../src/config/fathers.ts';
import { tags, tagSlugs } from '../src/config/tags.ts';

/** Slugs become URLs (`/fathers/<slug>/`), so they must be URL-safe. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

test('fathers: slugs are URL-safe', () => {
  for (const slug of fatherSlugs) {
    assert.match(slug, SLUG, `father slug "${slug}" is not URL-safe`);
  }
});

test('tags: slugs are URL-safe', () => {
  for (const slug of tagSlugs) {
    assert.match(slug, SLUG, `tag slug "${slug}" is not URL-safe`);
  }
});

test('fathers: every entry has a non-empty Arabic name', () => {
  for (const slug of fatherSlugs) {
    assert.ok(fathers[slug].name_ar.trim() !== '', `father "${slug}" has no name_ar`);
  }
});

test('tags: every entry has a non-empty Arabic label', () => {
  for (const slug of tagSlugs) {
    assert.ok(tags[slug].label_ar.trim() !== '', `tag "${slug}" has no label_ar`);
  }
});

test('tags: labels are unique', () => {
  const seen = new Set<string>();

  for (const slug of tagSlugs) {
    const label = tags[slug].label_ar;
    assert.ok(!seen.has(label), `duplicate tag label "${label}"`);
    seen.add(label);
  }
});

test('fathers: names are unique', () => {
  const seen = new Set<string>();

  for (const slug of fatherSlugs) {
    const name = fathers[slug].name_ar;
    assert.ok(!seen.has(name), `duplicate father name "${name}"`);
    seen.add(name);
  }
});
