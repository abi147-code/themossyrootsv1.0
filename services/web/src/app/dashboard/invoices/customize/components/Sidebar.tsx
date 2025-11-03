'use client';

import { ChangeEvent, ReactNode, useState } from 'react';
import Image from 'next/image';
import { useDraggable } from '@dnd-kit/core';
import clsx from 'clsx';
import type { Block } from '../hooks/useInvoiceBuilder';

export type PaletteBlock = {
  id: string;
  label: string;
  description?: string;
  preview?: string;
  block: Omit<Block, 'id'>;
};

export type PaletteGroup = {
  id: string;
  title: string;
  items: PaletteBlock[];
};

type SidebarProps = {
  groups: PaletteGroup[];
  onAddBlock: (item: PaletteBlock) => void;
  onUploadImage: (src: string) => void;
  placeholderImages: string[];
};

function PaletteItem({ item, onAddBlock }: { item: PaletteBlock; onAddBlock: (item: PaletteBlock) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.id}`,
    data: {
      source: 'palette',
      item,
    },
  });

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onAddBlock(item)}
      className={clsx(
        'group flex w-full flex-col gap-1 rounded-xl border border-slate-800/70 bg-slate-950/80 px-3 py-3 text-left text-sm transition',
        'hover:border-sky-500 hover:bg-slate-900/80 hover:shadow-[0_8px_16px_rgba(8,47,73,0.25)]',
        isDragging && 'opacity-60'
      )}
    >
      <p className="font-semibold text-slate-100 transition group-hover:text-sky-200">{item.label}</p>
      {item.description ? <p className="text-xs text-slate-400">{item.description}</p> : null}
    </button>
  );
}

type AccordionSectionProps = {
  id: string;
  title: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
};

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={clsx('h-4 w-4', className)}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function AccordionSection({ id, title, open, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 shadow-[0_14px_26px_rgba(2,6,23,0.35)]">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:text-sky-200"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronIcon className={clsx('text-slate-500 transition-transform duration-300', open && 'rotate-180 text-sky-300')} />
      </button>
      <div
        className={clsx(
          'grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0 px-4 pb-4 pt-0 text-sm text-slate-200">{children}</div>
      </div>
    </div>
  );
}

export default function Sidebar({ groups, onAddBlock, onUploadImage, placeholderImages }: SidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>(() => [...groups.map((group) => group.id), 'images']);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    // reset input so user can upload the same file twice
    event.target.value = '';
  };

  const toggleSection = (id: string) => {
    setOpenSections((current) => (current.includes(id) ? current.filter((sectionId) => sectionId !== id) : [...current, id]));
  };

  return (
    <aside
      className="fixed z-30 flex w-64 min-w-[16rem] flex-col border-r border-slate-800 bg-slate-950/90 text-slate-100 shadow-[0_20px_45px_rgba(2,6,23,0.45)] transition-all duration-300"
      style={{
        left: 'var(--nav-width, 4rem)',
        top: 'var(--dashboard-header-offset, 4rem)',
        height: 'calc(100vh - var(--dashboard-header-offset, 4rem))',
      }}
    >
      <div className="border-b border-slate-800/60 px-6 py-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Palette</h2>
        <p className="mt-2 text-xs text-slate-500">
          Drag blocks into the canvas or tap to add. Collapse sections to keep your workspace focused.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {groups.map((group) => (
          <AccordionSection
            key={group.id}
            id={group.id}
            title={group.title}
            open={openSections.includes(group.id)}
            onToggle={toggleSection}
          >
            <div className="space-y-2">
              {group.items.map((item) => (
                <PaletteItem key={item.id} item={item} onAddBlock={onAddBlock} />
              ))}
            </div>
          </AccordionSection>
        ))}
        <AccordionSection
          id="images"
          title="Images"
          open={openSections.includes('images')}
          onToggle={toggleSection}
        >
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-5 text-center text-xs text-slate-300 transition hover:border-sky-500 hover:text-sky-200">
            <span>Upload image</span>
            <span className="text-slate-500">PNG / JPG up to 2MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {placeholderImages.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => onUploadImage(src)}
                className="group relative overflow-hidden rounded-lg border border-slate-800/70 transition hover:border-sky-500 hover:shadow-[0_8px_16px_rgba(8,47,73,0.3)]"
              >
                <Image
                  src={src}
                  alt="Invoice placeholder"
                  width={120}
                  height={90}
                  className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
                />
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Need inspiration? Start with a placeholder or upload your own brand imagery.
          </p>
        </AccordionSection>
      </div>
    </aside>
  );
}
