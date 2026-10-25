import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import LayoutDemo from './LayoutDemo';

describe('published content source', () => {
  it.each(['#/', '#/photos', '#/journey', '#/projects'])('%s shows no archived media or invented collections', (route) => {
    const html = renderToStaticMarkup(createElement(LayoutDemo, { route }));
    expect(html).not.toContain('/annual/');
    expect(html).not.toContain('/cms/media/');
    expect(html).not.toContain('After Dark');
    expect(html).not.toContain('Street Notes');
  });
});
