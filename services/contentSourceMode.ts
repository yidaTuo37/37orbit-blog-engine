export type ContentSourceMode = 'api' | 'static';

export function resolveContentSourceMode(value?: string): ContentSourceMode {
  return value === 'static' ? 'static' : 'api';
}
