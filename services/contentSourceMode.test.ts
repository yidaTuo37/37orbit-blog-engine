import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveContentSourceMode } from './contentSourceMode.ts';

describe('resolveContentSourceMode', () => {
  it('uses the live API when no source mode is configured', () => {
    assert.equal(resolveContentSourceMode(undefined), 'api');
  });

  it('uses static content only when explicitly requested', () => {
    assert.equal(resolveContentSourceMode('static'), 'static');
  });
});
