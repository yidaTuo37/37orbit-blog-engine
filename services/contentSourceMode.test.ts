import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveContentSourceMode, resolveContentMediaUrl } from './contentSourceMode.ts';

describe('resolveContentSourceMode', () => {
  it('uses the live API when no source mode is configured', () => {
    assert.equal(resolveContentSourceMode(undefined), 'api');
  });

  it('uses static content only when explicitly requested', () => {
    assert.equal(resolveContentSourceMode('static'), 'static');
  });
});

describe('resolveContentMediaUrl', () => {
  it('keeps bundled media root-relative in explicit static mode', () => {
    assert.equal(
      resolveContentMediaUrl('static', 'https://cms.37orbit.com', '/cms/media/posts/cover.jpg'),
      '/cms/media/posts/cover.jpg',
    );
  });

  it('resolves live API media against the configured CMS origin', () => {
    assert.equal(
      resolveContentMediaUrl('api', 'https://cms.37orbit.com', '/media/posts/cover.jpg'),
      'https://cms.37orbit.com/media/posts/cover.jpg',
    );
  });
});
