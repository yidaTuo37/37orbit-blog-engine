export type ContentSourceMode = 'api' | 'static';

export function resolveContentSourceMode(value?: string): ContentSourceMode {
  return value === 'static' ? 'static' : 'api';
}

export function resolveContentMediaUrl(
  mode: ContentSourceMode,
  apiUrl: string,
  url?: string | null,
): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || !url.startsWith('/')) return url;
  return mode === 'api' && apiUrl ? `${apiUrl}${url}` : url;
}
