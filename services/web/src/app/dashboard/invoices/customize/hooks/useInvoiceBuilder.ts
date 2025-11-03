'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';

export type TextBlock = {
  id: string;
  type: 'text';
  html: string;
  font?: string;
  fontSize?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
};

export type ButtonBlock = {
  id: string;
  type: 'button';
  label: string;
  url?: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
  textColor?: string;
};

export type ImageBlock = {
  id: string;
  type: 'image';
  src: string;
  alt?: string;
  widthPct?: number;
  cornerRadius?: number;
};

export type ShapeBlock = {
  id: string;
  type: 'shape';
  shape: 'rect' | 'circle';
  color: string;
  size: number;
};

export type DividerBlock = {
  id: string;
  type: 'divider';
  thickness?: number;
  color?: string;
};

export type LayoutBlock = {
  id: string;
  type: 'layout';
  layoutType: 'row' | 'column' | 'spacer';
  height?: number;
};

export type Block =
  | { id: string; type: 'text'; html: string; font?: string; fontSize?: number; color?: string; align?: 'left' | 'center' | 'right' }
  | { id: string; type: 'button'; label: string; url?: string; align?: 'left' | 'center' | 'right'; color?: string; textColor?: string }
  | { id: string; type: 'image'; src: string; alt?: string; widthPct?: number; cornerRadius?: number }
  | { id: string; type: 'shape'; shape: 'rect' | 'circle'; color: string; size: number }
  | { id: string; type: 'divider'; thickness?: number; color?: string }
  | { id: string; type: 'layout'; layoutType: 'row' | 'column' | 'spacer'; height?: number };

export type InvoiceLayout = {
  title: string;
  blocks: Block[];
};

const DRAFT_KEY = 'tmr.invoiceBuilder.draft';
const TEMPLATE_KEY = 'tmr.invoiceBuilder.templates';

type StoredTemplate = {
  id: string;
  name: string;
  savedAt: string;
  layout: InvoiceLayout;
};

type AddBlockInput = Omit<Block, 'id'>;

export function useInvoiceBuilder() {
  const [layout, setLayout] = useState<InvoiceLayout>({
    title: 'Invoice Draft',
    blocks: [],
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(DRAFT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as InvoiceLayout;
        if (parsed?.blocks && Array.isArray(parsed.blocks)) {
          setLayout({
            title: parsed.title || 'Invoice Draft',
            blocks: parsed.blocks,
          });
        }
      }
    } catch (error) {
      console.warn('[InvoiceBuilder] Failed to parse stored draft:', error);
    } finally {
      setIsDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftLoaded || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(layout));
    } catch (error) {
      console.warn('[InvoiceBuilder] Failed to auto-save draft:', error);
    }
  }, [layout, isDraftLoaded]);

  const addBlock = useCallback(
    (input: AddBlockInput) => {
      const block = { ...input, id: nanoid() } as Block;
      setLayout((prev) => ({
        ...prev,
        blocks: [...prev.blocks, block],
      }));
      setSelectedBlockId(block.id);
      return block.id;
    },
    []
  );

  const updateBlock = useCallback((id: string, patch: Partial<Block>) => {
    setLayout((prev: InvoiceLayout): InvoiceLayout => {
      const updatedBlocks: Block[] = prev.blocks.map((block) =>
        block.id === id ? ({ ...block, ...patch } as Block) : block
      );
      return { ...prev, blocks: updatedBlocks } as InvoiceLayout;
    });
  }, []);

  const removeBlock = useCallback((id: string) => {
    setLayout((prev) => {
      const blocks = prev.blocks.filter((block) => block.id !== id);
      return { ...prev, blocks };
    });
    setSelectedBlockId((current) => (current === id ? null : current));
  }, []);

  const moveBlock = useCallback((activeId: string, overId: string | null) => {
    setLayout((prev) => {
      const blocks = [...prev.blocks];
      const activeIndex = blocks.findIndex((block) => block.id === activeId);
      if (activeIndex === -1) return prev;

      let targetIndex = overId ? blocks.findIndex((block) => block.id === overId) : blocks.length - 1;
      if (targetIndex === -1) {
        targetIndex = blocks.length - 1;
      }

      const [moved] = blocks.splice(activeIndex, 1);
      if (targetIndex >= blocks.length) {
        blocks.push(moved);
      } else {
        const adjustedIndex = activeIndex < targetIndex ? targetIndex - 1 : targetIndex;
        blocks.splice(Math.max(adjustedIndex, 0), 0, moved);
      }
      return { ...prev, blocks };
    });
  }, []);

  const setTitle = useCallback((title: string) => {
    setLayout((prev) => ({ ...prev, title }));
  }, []);

  const selectBlock = useCallback((id: string | null) => {
    setSelectedBlockId(id);
  }, []);

  const selectedBlock = useMemo(
    () => layout.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [layout.blocks, selectedBlockId]
  );

  const saveDraft = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(layout));
      return true;
    } catch (error) {
      console.warn('[InvoiceBuilder] Failed to save draft:', error);
      return false;
    }
  }, [layout]);

  const loadDraft = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem(DRAFT_KEY);
      if (!stored) return false;
      const parsed = JSON.parse(stored) as InvoiceLayout;
      if (!parsed || !Array.isArray(parsed.blocks)) return false;
      setLayout({
        title: parsed.title || 'Invoice Draft',
        blocks: parsed.blocks,
      });
      setSelectedBlockId(parsed.blocks.at(-1)?.id ?? null);
      return true;
    } catch (error) {
      console.warn('[InvoiceBuilder] Failed to load draft:', error);
      return false;
    }
  }, []);

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.warn('[InvoiceBuilder] Failed to clear draft key:', error);
    }
  }, []);

  const saveTemplate = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem(TEMPLATE_KEY);
      const templates: StoredTemplate[] = stored ? (JSON.parse(stored) as StoredTemplate[]) : [];
      const template: StoredTemplate = {
        id: nanoid(),
        name: `${layout.title || 'Invoice Template'} (${new Date().toLocaleString()})`,
        savedAt: new Date().toISOString(),
        layout,
      };
      templates.push(template);
      window.localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
      return true;
    } catch (error) {
      console.warn('[InvoiceBuilder] Failed to save template:', error);
      return false;
    }
  }, [layout]);

  const resetLayout = useCallback(() => {
    setLayout({
      title: 'Invoice Draft',
      blocks: [],
    });
    setSelectedBlockId(null);
  }, []);

  return {
    layout,
    selectedBlockId,
    selectedBlock,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    setTitle,
    selectBlock,
    saveDraft,
    loadDraft,
    saveTemplate,
    clearDraft,
    resetLayout,
  };
}
