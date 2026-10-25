import type { HomepageContent, SiteSettings } from '../types';

interface HomeContentService {
  getHomepage(): Promise<HomepageContent>;
  getSettings(): Promise<SiteSettings>;
}

interface HomeContentResult {
  homepage?: HomepageContent;
  settings?: SiteSettings;
}

interface HomeContentCallbacks {
  onHomepage?: (homepage: HomepageContent) => void;
  onSettings?: (settings: SiteSettings) => void;
}

export async function loadHomeContent(
  service: HomeContentService,
  callbacks: HomeContentCallbacks = {},
): Promise<HomeContentResult> {
  const homepageResult = service.getHomepage()
    .then((homepage) => {
      callbacks.onHomepage?.(homepage);
      return { homepage };
    })
    .catch(() => ({}));
  const settingsResult = service.getSettings()
    .then((settings) => {
      callbacks.onSettings?.(settings);
      return { settings };
    })
    .catch(() => ({}));
  const [homepage, settings] = await Promise.all([homepageResult, settingsResult]);

  return {
    ...homepage,
    ...settings,
  };
}
