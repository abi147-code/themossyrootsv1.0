'use client';

import { memo } from 'react';
import type { FocusEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import type { Block, InvoiceLayout } from '../hooks/useInvoiceBuilder';

type CanvasProps = {
  layout: InvoiceLayout;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  onRemoveBlock: (id: string) => void;
  onMoveBlock: (activeId: string, overId: string | null) => void;
};

type SortableBlockProps = {
  block: Block;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onTextCommit: (id: string, html: string) => void;
};

const SortableBlock = memo(
  ({ block, isSelected, onSelect, onRemove, onMoveDown, onMoveUp, onTextCommit }: SortableBlockProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: block.id,
      data: {
        source: 'canvas',
        blockId: block.id,
      },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const handleTextBlur = (event: FocusEvent<HTMLDivElement>) => {
      onTextCommit(block.id, event.currentTarget.innerHTML);
    };

    const blockCommonClasses = clsx(
      'relative rounded-2xl border border-transparent bg-white px-5 py-4 transition focus:outline-none',
      'shadow-sm shadow-slate-900/10'
    );

    const renderBlockContent = () => {
      switch (block.type) {
        case 'text':
          return (
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={handleTextBlur}
              className={clsx('min-h-[32px] outline-none', {
                'text-left': block.align !== 'center' && block.align !== 'right',
                'text-center': block.align === 'center',
                'text-right': block.align === 'right',
              })}
              style={{
                fontFamily: block.font,
                fontSize: block.fontSize ? `${block.fontSize}px` : undefined,
                color: block.color,
              }}
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          );
        case 'button':
          return (
            <div className="flex w-full" style={{ justifyContent: block.align ?? 'flex-start' }}>
              <button
                type="button"
                className="rounded-full px-6 py-2 text-sm font-semibold shadow-sm"
                style={{
                  background: block.color || '#0ea5e9',
                  color: block.textColor || '#0f172a',
                }}
              >
                {block.label}
              </button>
            </div>
          );
        case 'image':
          return (
            <img
              src={block.src}
              alt={block.alt || 'Invoice element'}
              className="mx-auto block"
              style={{
                width: `${block.widthPct ?? 80}%`,
                borderRadius: block.cornerRadius ?? 12,
              }}
            />
          );
        case 'shape':
          return (
            <div className="flex items-center justify-center">
              <div
                style={{
                  width: block.size,
                  height: block.size,
                  background: block.color,
                  borderRadius: block.shape === 'circle' ? '9999px' : '16px',
                }}
              />
            </div>
          );
        case 'divider':
          return (
            <div className="py-4">
              <hr
                className="border-slate-300"
                style={{ borderWidth: block.thickness ?? 1, borderColor: block.color ?? '#cbd5f5' }}
              />
            </div>
          );
        case 'layout':
          if (block.layoutType === 'spacer') {
            return <div style={{ height: block.height ?? 32 }} />;
          }
          return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100/70 px-4 py-3 text-xs text-slate-500">
              {block.layoutType === 'row' ? 'Horizontal flex row placeholder' : 'Stack column placeholder'}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={clsx(
          blockCommonClasses,
          'group cursor-grab border border-slate-200 bg-white',
          isSelected && 'border-sky-400 ring-2 ring-sky-500/40',
          isDragging && 'opacity-70'
        )}
        onClick={() => onSelect(block.id)}
        role="presentation"
      >
        <div className="absolute right-3 top-2 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            className="rounded-full bg-slate-900/80 px-2 py-1 text-xs text-white shadow"
            onClick={(event) => {
              event.stopPropagation();
              onMoveUp(block.id);
            }}
          >
            Up
          </button>
          <button
            type="button"
            className="rounded-full bg-slate-900/80 px-2 py-1 text-xs text-white shadow"
            onClick={(event) => {
              event.stopPropagation();
              onMoveDown(block.id);
            }}
          >
            Down
          </button>
          <button
            type="button"
            className="rounded-full bg-rose-600 px-2 py-1 text-xs text-white shadow"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(block.id);
            }}
          >
            Del
          </button>
        </div>
        {renderBlockContent()}
      </div>
    );
  }
);
SortableBlock.displayName = 'SortableBlock';

export default function Canvas({
  layout,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onRemoveBlock,
  onMoveBlock,
}: CanvasProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: 'canvas-dropzone',
  });

  const handleMoveUp = (id: string) => {
    const blocks = layout.blocks;
    const index = blocks.findIndex((block) => block.id === id);
    if (index > 0) {
      const overId = blocks[index - 1]?.id ?? null;
      onMoveBlock(id, overId);
    }
  };

  const handleMoveDown = (id: string) => {
    const blocks = layout.blocks;
    const index = blocks.findIndex((block) => block.id === id);
    if (index !== -1 && index < blocks.length - 1) {
      const overId = blocks[index + 1]?.id ?? null;
      onMoveBlock(id, overId);
    }
  };

  const handleTextCommit = (id: string, html: string) => {
    onUpdateBlock(id, { html });
  };

  return (
    <div className="mx-auto flex h-full max-h-[90vh] w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-neutral-50 shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-neutral-50 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Canvas</p>
          <p className="text-sm text-slate-600">Drag blocks here to build your invoice layout.</p>
        </div>
        <p className="text-xs text-slate-500">
          Blocks: <span className="font-semibold text-slate-700">{layout.blocks.length}</span>
        </p>
      </div>
      <div className="flex-1 overflow-auto px-8 py-10">
        <div
          ref={setDroppableRef}
          className={clsx(
            'mx-auto flex min-h-[560px] w-full max-w-none flex-col gap-6 rounded-3xl border-2 border-dashed border-slate-300/80 bg-white p-12 transition',
            isOver && 'border-sky-400 bg-white'
          )}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onSelectBlock(null);
            }
          }}
        >
          {layout.blocks.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-slate-400">
              <span className="text-xl">dY�</span>
              <p>
                Start by dragging elements from the left panel or click a block to add it instantly. Everything you drop here is editable.
              </p>
            </div>
          ) : (
            <SortableContext items={layout.blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              {layout.blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={onSelectBlock}
                  onRemove={onRemoveBlock}
                  onMoveDown={handleMoveDown}
                  onMoveUp={handleMoveUp}
                  onTextCommit={handleTextCommit}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}
