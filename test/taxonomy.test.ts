import test from 'node:test';
import assert from 'node:assert/strict';
import { groupByFather, groupByTag } from '../src/lib/taxonomy.ts';

/** Minimal shape the grouping helpers accept. */
function article(author_slug: string, tags: string[] = []) {
  return { data: { author_slug, tags } };
}

test('groupByFather: groups articles under their father', () => {
  const groups = groupByFather([article('sample'), article('sample'), article('sample')]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].slug, 'sample');
  assert.equal(groups[0].articles.length, 3);
  assert.equal(groups[0].father.name_ar, 'اسم الأب (نموذج)');
});

test('groupByFather: skips unknown slugs instead of throwing', () => {
  const groups = groupByFather([article('sample'), article('does-not-exist')]);

  assert.deepEqual(
    groups.map((group) => group.slug),
    ['sample'],
  );
});

test('groupByFather: empty input yields no groups', () => {
  assert.deepEqual(groupByFather([]), []);
});

test('groupByTag: an article with several tags lands in each group', () => {
  const groups = groupByTag([article('sample', ['prayer', 'fast'])]);

  assert.deepEqual(
    groups.map((group) => group.slug).sort(),
    ['fast', 'prayer'],
  );
  for (const group of groups) {
    assert.equal(group.articles.length, 1);
  }
});

test('groupByTag: sorts by article count, most used first', () => {
  const groups = groupByTag([
    article('sample', ['prayer']),
    article('sample', ['prayer', 'fast']),
  ]);

  assert.deepEqual(
    groups.map((group) => group.slug),
    ['prayer', 'fast'],
  );
  assert.equal(groups[0].articles.length, 2);
  assert.equal(groups[1].articles.length, 1);
});

test('groupByTag: unknown tags are skipped', () => {
  const groups = groupByTag([article('sample', ['prayer', 'nope'])]);

  assert.deepEqual(
    groups.map((group) => group.slug),
    ['prayer'],
  );
});

test('groupByTag: arabic labels come from the registry', () => {
  const groups = groupByTag([article('sample', ['christmas'])]);

  assert.equal(groups[0].tag.label_ar, 'الميلاد');
});

test('groupByTag: articles with no tags produce no groups', () => {
  assert.deepEqual(groupByTag([article('sample', [])]), []);
});
