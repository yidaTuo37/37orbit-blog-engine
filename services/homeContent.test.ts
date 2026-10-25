import { describe, expect, it, vi } from 'vitest';
import type { HomepageContent, SiteSettings } from '../types';
import { loadHomeContent } from './homeContent';

const homepage = {
  mainWork: null,
  frames: { frameA: null, frameB: null },
  wallLabels: [],
} satisfies HomepageContent;

const settings = {
  home_eyebrow: 'Eyebrow',
  home_title: 'Title',
  home_intro: 'Intro',
  statement_label: 'Statement',
  statement_body: 'Body',
  wall_labels_label: 'Labels',
  curator_label: 'Curator',
  curator_body: 'Body',
  curator_meta: 'Meta',
} satisfies SiteSettings;

describe('loadHomeContent', () => {
  it('publishes homepage content before a pending settings request resolves', async () => {
    const onHomepage = vi.fn();
    const pendingSettings = new Promise<SiteSettings>(() => {});

    void loadHomeContent({
      getHomepage: vi.fn().mockResolvedValue(homepage),
      getSettings: vi.fn().mockReturnValue(pendingSettings),
    }, { onHomepage });

    await vi.waitFor(() => expect(onHomepage).toHaveBeenCalledWith(homepage));
  });

  it('publishes settings before a pending homepage request resolves', async () => {
    const onSettings = vi.fn();
    const pendingHomepage = new Promise<HomepageContent>(() => {});

    void loadHomeContent({
      getHomepage: vi.fn().mockReturnValue(pendingHomepage),
      getSettings: vi.fn().mockResolvedValue(settings),
    }, { onSettings });

    await vi.waitFor(() => expect(onSettings).toHaveBeenCalledWith(settings));
  });

  it('retains homepage data when settings fail', async () => {
    const result = await loadHomeContent({
      getHomepage: vi.fn().mockResolvedValue(homepage),
      getSettings: vi.fn().mockRejectedValue(new Error('settings unavailable')),
    });

    expect(result).toEqual({ homepage });
  });

  it('retains settings when homepage data fails', async () => {
    const result = await loadHomeContent({
      getHomepage: vi.fn().mockRejectedValue(new Error('homepage unavailable')),
      getSettings: vi.fn().mockResolvedValue(settings),
    });

    expect(result).toEqual({ settings });
  });
});
