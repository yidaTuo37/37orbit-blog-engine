import type { Post } from '../types';

export type FrameThemeGroup = {
  theme: string;
  posts: Post[];
};

export function getFrameTheme(post: Pick<Post, 'tags'>): string {
  return post.tags.find((tag) => tag.trim())?.trim() || 'Unsorted';
}

export function groupFramePostsByTheme(posts: Post[]): FrameThemeGroup[] {
  const groups = new Map<string, Post[]>();

  posts.forEach((post) => {
    const theme = getFrameTheme(post);
    groups.set(theme, [...(groups.get(theme) || []), post]);
  });

  return Array.from(groups, ([theme, groupedPosts]) => ({ theme, posts: groupedPosts }));
}
