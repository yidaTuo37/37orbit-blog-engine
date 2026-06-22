import React from 'react';
import type {
  BlockV01,
  BlockDocV01,
  InlineNodeV01,
  ParagraphBlockV01,
  HeadingBlockV01,
  ImageBlockV01,
  TwoColumnBlockV01,
} from '../blocks';
import { getMediaURL } from '../services/api';

type Props = {
  doc: BlockDocV01;
  onImageClick?: (absoluteUrl: string) => void;
  className?: string;
};

const renderInline = (nodes: InlineNodeV01[]) => {
  return nodes.map((n, idx) => {
    if (n.type === 'text') return <React.Fragment key={idx}>{n.text}</React.Fragment>;
    if (n.type === 'link') {
      return (
        <a
          key={idx}
          href={n.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FF791B] hover:underline"
        >
          {renderInline(n.children)}
        </a>
      );
    }
    // unknown inline: best-effort fallback
    return <React.Fragment key={idx}>{''}</React.Fragment>;
  });
};

const Heading: React.FC<{ block: HeadingBlockV01 }> = ({ block }) => {
  const level = Math.min(6, Math.max(1, block.level));
  const cls =
    level === 1
      ? 'text-3xl md:text-4xl font-black text-white mt-10 mb-4'
      : level === 2
      ? 'text-2xl md:text-3xl font-bold text-white mt-10 mb-4'
      : level === 3
      ? 'text-xl md:text-2xl font-bold text-white mt-8 mb-3'
      : 'text-lg md:text-xl font-semibold text-white mt-6 mb-3';

  const Tag = (`h${level}` as unknown) as React.ElementType;
  return <Tag className={cls}>{renderInline(block.children)}</Tag>;
};

const Paragraph: React.FC<{ block: ParagraphBlockV01 }> = ({ block }) => (
  <p className="leading-relaxed text-gray-300">{renderInline(block.children)}</p>
);

const ImageBlock: React.FC<{ block: ImageBlockV01; onImageClick?: (url: string) => void }> = ({
  block,
  onImageClick,
}) => {
  const abs = getMediaURL(block.url);
  if (!abs) return null;

  return (
    <figure className="my-10">
      <div className="rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        <img
          src={abs}
          alt={block.alt ?? ''}
          className={onImageClick ? 'cursor-zoom-in' : ''}
          onClick={() => onImageClick?.(abs)}
          loading="lazy"
        />
      </div>
      {(block.caption || block.alt) && (
        <figcaption className="mt-3 text-xs text-white/40">
          {block.caption ?? block.alt}
        </figcaption>
      )}
    </figure>
  );
};

const TwoColumn: React.FC<{
  block: TwoColumnBlockV01;
  onImageClick?: (url: string) => void;
}> = ({ block, onImageClick }) => {
  const left = block.left ?? [];
  const right = block.right ?? [];

  return (
    <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-6">
        {left.map((b) => (
          <Block key={b.id} block={b} onImageClick={onImageClick} />
        ))}
      </div>
      <div className="space-y-6">
        {right.map((b) => (
          <Block key={b.id} block={b} onImageClick={onImageClick} />
        ))}
      </div>
    </div>
  );
};

const Block: React.FC<{ block: BlockV01; onImageClick?: (url: string) => void }> = ({
  block,
  onImageClick,
}) => {
  switch (block.type) {
    case 'heading':
      return <Heading block={block as HeadingBlockV01} />;
    case 'paragraph':
      return <Paragraph block={block as ParagraphBlockV01} />;
    case 'image':
      return <ImageBlock block={block as ImageBlockV01} onImageClick={onImageClick} />;
    case 'twoColumn':
      return <TwoColumn block={block as TwoColumnBlockV01} onImageClick={onImageClick} />;
    default:
      // unknown block: keep a visible placeholder (so你能发现数据落了坑)
      return (
        <div className="my-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/50 font-mono">
          Unknown block: <span className="text-white/70">{block.type}</span>
        </div>
      );
  }
};

const BlockRenderer: React.FC<Props> = ({ doc, onImageClick, className }) => {
  return (
    <div className={className ?? 'space-y-6'}>
      {doc.blocks.map((b) => (
        <Block key={b.id} block={b} onImageClick={onImageClick} />
      ))}
    </div>
  );
};

export default BlockRenderer;
