// blocks.ts — Block JSON v0.1 (content contract)

export type BlockDocV01 = {
  version: '0.1';
  blocks: BlockV01[];
};

export type InlineNodeV01 =
  | TextInlineNodeV01
  | LinkInlineNodeV01
  | InlineNodeV01Unknown;

export type BlockV01 =
  | ParagraphBlockV01
  | HeadingBlockV01
  | ImageBlockV01
  | TwoColumnBlockV01
  | UnknownBlockV01;

export type TextInlineNodeV01 = {
  type: 'text';
  text: string;
};

export type LinkInlineNodeV01 = {
  type: 'link';
  url: string;
  children: InlineNodeV01[];
};

export type InlineNodeV01Unknown = {
  type: string;
  [key: string]: unknown;
};

export type ParagraphBlockV01 = {
  id: string;
  type: 'paragraph';
  children: InlineNodeV01[];
};

export type HeadingBlockV01 = {
  id: string;
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNodeV01[];
};

export type ImageBlockV01 = {
  id: string;
  type: 'image';
  url: string; // normalized: must be present
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type TwoColumnBlockV01 = {
  id: string;
  type: 'twoColumn';
  left: BlockV01[];
  right: BlockV01[];
  leftRatio?: number; // e.g. 0.5 (optional)
  rightRatio?: number;
};

export type UnknownBlockV01 = {
  id: string;
  type: string;
  [key: string]: unknown;
};

/** Inline normalizer: tolerant mapping from Strapi blocks (or your future CMS) */
const normalizeInline = (node: any): InlineNodeV01 | null => {
  if (!node || typeof node !== 'object') return null;

  if (node.type === 'text') {
    return { type: 'text', text: typeof node.text === 'string' ? node.text : '' };
  }

  // Common pattern: { type:'link', url:'', children:[...] }
  if (node.type === 'link') {
    const url = typeof node.url === 'string' ? node.url : '';
    const children = Array.isArray(node.children)
      ? node.children.map(normalizeInline).filter(Boolean) as InlineNodeV01[]
      : [];
    return { type: 'link', url, children };
  }

  // Sometimes Strapi or editors use { type:'a', href:'' }
  if (node.type === 'a' || node.type === 'anchor') {
    const url =
      typeof node.href === 'string' ? node.href :
      typeof node.url === 'string' ? node.url : '';
    const children = Array.isArray(node.children)
      ? node.children.map(normalizeInline).filter(Boolean) as InlineNodeV01[]
      : [];
    return { type: 'link', url, children };
  }

  return { type: String(node.type ?? 'unknown_inline'), ...node };
};

const normalizeId = (block: any, index: number) => {
  if (typeof block?.id === 'string' || typeof block?.id === 'number') return String(block.id);
  return `b_${index}`;
};

const clampHeadingLevel = (level: any): 1 | 2 | 3 | 4 | 5 | 6 => {
  const n = Number(level);
  if (!Number.isFinite(n)) return 2;
  return Math.min(6, Math.max(1, Math.floor(n))) as 1 | 2 | 3 | 4 | 5 | 6;
};

/**
 * normalizeStrapiBlocksToV01
 * - input: Strapi blocks array OR already-normalized v0.1 blocks array
 * - output: { version:'0.1', blocks:[...] }
 */
export const normalizeStrapiBlocksToV01 = (input: any): BlockDocV01 => {
  if (!Array.isArray(input)) return { version: '0.1', blocks: [] };

  const normalizeBlock = (block: any, index: number): BlockV01 | null => {
    if (!block || typeof block !== 'object') return null;

    const id = normalizeId(block, index);
    const type = String(block.type ?? 'unknown');

    if (type === 'paragraph') {
      const children = Array.isArray(block.children)
        ? (block.children.map(normalizeInline).filter(Boolean) as InlineNodeV01[])
        : [];
      return { id, type: 'paragraph', children };
    }

    if (type === 'heading') {
      const level = clampHeadingLevel(block.level);
      const children = Array.isArray(block.children)
        ? (block.children.map(normalizeInline).filter(Boolean) as InlineNodeV01[])
        : [];
      return { id, type: 'heading', level, children };
    }

    if (type === 'image') {
      // Be tolerant: image.url | image.image.url | image.media.url | url
      const rawUrl =
        (typeof block.url === 'string' && block.url) ||
        (typeof block?.image?.url === 'string' && block.image.url) ||
        (typeof block?.media?.url === 'string' && block.media.url) ||
        (typeof block?.file?.url === 'string' && block.file.url) ||
        '';

      if (!rawUrl) {
        // Keep as unknown so you notice data problems (instead of silently dropping)
        return { id, type: 'image', url: '', ...block } as UnknownBlockV01;
      }

      const alt =
        typeof block.alt === 'string' ? block.alt :
        typeof block?.image?.alternativeText === 'string' ? block.image.alternativeText :
        undefined;

      const caption =
        typeof block.caption === 'string' ? block.caption :
        typeof block?.image?.caption === 'string' ? block.image.caption :
        undefined;

      const width =
        typeof block.width === 'number' ? block.width :
        typeof block?.image?.width === 'number' ? block.image.width :
        undefined;

      const height =
        typeof block.height === 'number' ? block.height :
        typeof block?.image?.height === 'number' ? block.image.height :
        undefined;

      return { id, type: 'image', url: rawUrl, alt, caption, width, height };
    }

    if (type === 'twoColumn') {
      // Your future CMS block, or hand-authored JSON
      const leftRaw = Array.isArray(block.left) ? block.left : [];
      const rightRaw = Array.isArray(block.right) ? block.right : [];

      const left = leftRaw
        .map((b: any, i: number) => normalizeBlock(b, i))
        .filter(Boolean) as BlockV01[];

      const right = rightRaw
        .map((b: any, i: number) => normalizeBlock(b, i))
        .filter(Boolean) as BlockV01[];

      const leftRatio = typeof block.leftRatio === 'number' ? block.leftRatio : undefined;
      const rightRatio = typeof block.rightRatio === 'number' ? block.rightRatio : undefined;

      return { id, type: 'twoColumn', left, right, leftRatio, rightRatio };
    }

    // unknown: keep it (do NOT drop)
    return { id, type, ...block } as UnknownBlockV01;
  };

  const blocks = input
    .map((b: any, i: number) => normalizeBlock(b, i))
    .filter(Boolean) as BlockV01[];

  return { version: '0.1', blocks };
};
