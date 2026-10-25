import { describe, expect, it } from 'vitest';
import { getContentApiEndpoint, getContentApiUrl } from './cmsConfig';

describe('getContentApiUrl', () => {
  it('uses same-origin /api when the content API URL is absent', () => {
    expect(getContentApiUrl()).toBe('/api');
  });

  it('builds an endpoint for a remote API origin', () => {
    expect(getContentApiEndpoint(getContentApiUrl('https://cms.example.com/'), '/homepage'))
      .toBe('https://cms.example.com/api/homepage');
  });

  it('preserves the Synology HTTPS port when the CMS is reached by domain', () => {
    expect(getContentApiEndpoint(getContentApiUrl('https://cms.37orbit.com:8443'), '/posts'))
      .toBe('https://cms.37orbit.com:8443/api/posts');
  });

  it('rejects a content API URL without an HTTP scheme', () => {
    expect(() => getContentApiUrl('cms.example.com')).toThrow('VITE_CONTENT_API_URL');
  });
});
