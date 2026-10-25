import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');

describe('Orbit article HTML CSS contract', () => {
  it('styles all documented figure sizes and layouts', () => {
    for (const selector of [
      '.post-content::after',
      '.post-content figure[data-figure-image]',
      '[data-size="33"]',
      '[data-size="50"]',
      '[data-size="67"]',
      '[data-size="100"]',
      '[data-layout="block-left"]',
      '[data-layout="block-center"]',
      '[data-layout="block-right"]',
      '[data-layout="wrap-left"]',
      '[data-layout="wrap-right"]',
    ]) {
      expect(css).toContain(selector);
    }
    expect(css).toContain('@media (max-width: 720px)');
  });

  it('styles all documented text variants, tones, and alignments', () => {
    for (const selector of [
      '[data-variant="small"]',
      '[data-variant="lead"]',
      '[data-variant="note"]',
      '[data-tone="muted"]',
      '[data-tone="accent"]',
      '[data-align="center"]',
      '[data-align="right"]',
    ]) {
      expect(css).toContain(selector);
    }
  });
});
