/** API origin for cross-origin CMS requests, or the same-origin `/api` default. */
export function getContentApiUrl(value?: string): string {
  if (!value) return '/api';
  if (!/^https?:\/\//.test(value)) {
    throw new Error('VITE_CONTENT_API_URL must be an absolute HTTP(S) URL');
  }
  return value.replace(/\/+$/, '');
}

export function getContentApiEndpoint(apiUrl: string, path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return apiUrl === '/api' ? `/api${suffix}` : `${apiUrl}/api${suffix}`;
}

export function getContentMediaOrigin(apiUrl: string): string {
  return apiUrl === '/api' ? '' : apiUrl;
}
