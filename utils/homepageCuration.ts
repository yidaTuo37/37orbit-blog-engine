import type { Post } from '../types';

export interface HomepageThemeGroup {
  theme: string;
  posts: Post[];
}

export interface HomepageBrowse {
  latestPosts: Post[];
  themeGroups: HomepageThemeGroup[];
}

export function sortHomepagePosts(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.updated_at || b.created_at).getTime() -
      new Date(a.updated_at || a.created_at).getTime(),
  );
}

export function groupHomepagePostsByTheme(posts: Post[]): HomepageThemeGroup[] {
  const groups = new Map<string, Post[]>();

  for (const post of sortHomepagePosts(posts)) {
    const theme = post.tags.find((tag) => tag.trim())?.trim() || '未分类';
    const group = groups.get(theme) ?? [];
    group.push(post);
    groups.set(theme, group);
  }

  return Array.from(groups, ([theme, groupedPosts]) => ({ theme, posts: groupedPosts }));
}

export function prepareHomepageBrowse(posts: Post[], excludedSlugs: string[] = []): HomepageBrowse {
  const publishedPosts = posts.filter((post) => post.status === 'published');
  const excluded = new Set(excludedSlugs);
  const sortedPosts = sortHomepagePosts(publishedPosts);

  return {
    latestPosts: sortedPosts.filter((post) => !excluded.has(post.slug)).slice(0, 6),
    themeGroups: groupHomepagePostsByTheme(publishedPosts.filter((post) => !excluded.has(post.slug))),
  };
}
