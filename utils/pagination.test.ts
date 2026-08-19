import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { collectAllPages } from './pagination.ts';

describe('collectAllPages', () => {
  it('requests pages until the reported total has been collected', async () => {
    const calls: number[] = [];
    const items = await collectAllPages(async (page, pageSize) => {
      calls.push(page);
      const all = ['a', 'b', 'c', 'd', 'e'];
      const start = (page - 1) * pageSize;
      return { items: all.slice(start, start + pageSize), total: all.length };
    }, 2);

    assert.deepEqual(calls, [1, 2, 3]);
    assert.deepEqual(items, ['a', 'b', 'c', 'd', 'e']);
  });

  it('stops safely when a backend returns an empty page before total', async () => {
    let calls = 0;
    const items = await collectAllPages(async () => {
      calls += 1;
      return calls === 1 ? { items: ['a'], total: 4 } : { items: [], total: 4 };
    }, 2);

    assert.equal(calls, 2);
    assert.deepEqual(items, ['a']);
  });
});
