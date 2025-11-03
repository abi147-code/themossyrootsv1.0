'use client';

import clsx from 'clsx';
import type { Block } from '../hooks/useInvoiceBuilder';

type PropertiesPanelProps = {
  selectedBlock: Block | null;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  onSaveDraft: () => void;
  onLoadDraft: () => void;
  onSaveTemplate: () => void;
  onPreview: () => void;
  onCreateImage: () => void;
};

const FONT_OPTIONS = ['Inter', 'DM Sans', 'Playfair Display', 'Roboto Serif', 'Space Grotesk'];

export default function PropertiesPanel({
  selectedBlock,
  onUpdateBlock,
  onSaveDraft,
  onLoadDraft,
  onSaveTemplate,
  onPreview,
  onCreateImage,
}: PropertiesPanelProps) {
  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedBlock || selectedBlock.type !== 'text') return;
    onUpdateBlock(selectedBlock.id, { font: event.target.value });
  };

  const handleColorChange = (color: string) => {
    if (!selectedBlock) return;
    if (selectedBlock.type === 'shape' || selectedBlock.type === 'button') {
      onUpdateBlock(selectedBlock.id, { color });
      return;
    }
    if (selectedBlock.type === 'text' || selectedBlock.type === 'divider') {
      onUpdateBlock(selectedBlock.id, { color });
    }
  };

  return (
    <aside className="flex h-full w-[16rem] min-w-[16rem] flex-col overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/85 shadow-[0_18px_36px_rgba(2,6,23,0.45)]">
      <div className="border-b border-slate-800/60 px-5 py-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Properties</h2>
        <p className="mt-2 text-xs text-slate-500">
          Fine-tune every block you drop onto the canvas. Styling updates apply instantly.
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <section className="rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-5 shadow-[0_12px_24px_rgba(2,6,23,0.35)]">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Quick actions</h3>
          <div className="mt-4 flex flex-col gap-2 text-xs">
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-2 uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
              onClick={onSaveDraft}
            >
              Save Draft
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-2 uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
              onClick={onLoadDraft}
            >
              Load Draft
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-2 uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
              onClick={onPreview}
            >
              Preview
            </button>
            <button
              type="button"
              className="rounded-lg border border-sky-500/60 px-3 py-2 uppercase tracking-[0.3em] text-sky-200 transition hover:border-sky-400 hover:text-sky-100"
              onClick={onSaveTemplate}
            >
              Save as Template
            </button>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={onCreateImage}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-sky-500 to-blue-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-[0_0_14px_rgba(56,189,248,0.6)] transition hover:shadow-[0_0_18px_rgba(56,189,248,0.75)]"
            >
              Create Image with AI
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-5 shadow-[0_12px_24px_rgba(2,6,23,0.35)]">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Selection</h3>
          {selectedBlock ? (
            <div className="mt-4 space-y-4 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Block type</p>
              <p className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                {selectedBlock.type.toUpperCase()}
              </p>

              {selectedBlock.type === 'text' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Font family</label>
                    <select
                      value={selectedBlock.font || 'Inter'}
                      onChange={handleFontChange}
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Font size</label>
                    <input
                      type="range"
                      min={12}
                      max={64}
                      value={selectedBlock.fontSize ?? 18}
                      onChange={(event) => onUpdateBlock(selectedBlock.id, { fontSize: Number(event.target.value) })}
                      className="mt-2 w-full"
                    />
                    <p className="text-xs text-slate-500">{selectedBlock.fontSize ?? 18}px</p>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Text color</label>
                    <input
                      type="color"
                      value={selectedBlock.color || '#0f172a'}
                      onChange={(event) => handleColorChange(event.target.value)}
                      className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => onUpdateBlock(selectedBlock.id, { align })}
                        className={clsx(
                          'flex-1 rounded-lg border px-2 py-2 text-xs uppercase tracking-[0.2em]',
                          selectedBlock.align === align
                            ? 'border-sky-400 bg-sky-500/15 text-sky-200'
                            : 'border-slate-700 text-slate-300'
                        )}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedBlock.type === 'button' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Label</label>
                    <input
                      value={selectedBlock.label}
                      onChange={(event) => onUpdateBlock(selectedBlock.id, { label: event.target.value })}
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">URL</label>
                    <input
                      value={selectedBlock.url || ''}
                      onChange={(event) => onUpdateBlock(selectedBlock.id, { url: event.target.value })}
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Button color</label>
                    <input
                      type="color"
                      value={selectedBlock.color || '#0ea5e9'}
                      onChange={(event) => handleColorChange(event.target.value)}
                      className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Text color</label>
                    <input
                      type="color"
                      value={selectedBlock.textColor || '#0f172a'}
                      onChange={(event) => onUpdateBlock(selectedBlock.id, { textColor: event.target.value })}
                      className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => onUpdateBlock(selectedBlock.id, { align })}
                        className={clsx(
                          'flex-1 rounded-lg border px-2 py-2 text-xs uppercase tracking-[0.2em]',
                          selectedBlock.align === align
                            ? 'border-sky-400 bg-sky-500/15 text-sky-200'
                            : 'border-slate-700 text-slate-300'
                        )}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedBlock.type === 'image' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Width</label>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={selectedBlock.widthPct ?? 80}
                      onChange={(event) =>
                        onUpdateBlock(selectedBlock.id, { widthPct: Number(event.target.value) })
                      }
                      className="mt-2 w-full"
                    />
                    <p className="text-xs text-slate-500">{selectedBlock.widthPct ?? 80}%</p>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Corner radius</label>
                    <input
                      type="range"
                      min={0}
                      max={64}
                      value={selectedBlock.cornerRadius ?? 12}
                      onChange={(event) =>
                        onUpdateBlock(selectedBlock.id, { cornerRadius: Number(event.target.value) })
                      }
                      className="mt-2 w-full"
                    />
                    <p className="text-xs text-slate-500">{selectedBlock.cornerRadius ?? 12}px</p>
                  </div>
                </div>
              ) : null}

              {selectedBlock.type === 'shape' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Color</label>
                    <input
                      type="color"
                      value={selectedBlock.color}
                      onChange={(event) => handleColorChange(event.target.value)}
                      className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Size</label>
                    <input
                      type="range"
                      min={40}
                      max={220}
                      value={selectedBlock.size}
                      onChange={(event) => onUpdateBlock(selectedBlock.id, { size: Number(event.target.value) })}
                      className="mt-2 w-full"
                    />
                    <p className="text-xs text-slate-500">{selectedBlock.size}px</p>
                  </div>
                </div>
              ) : null}

              {selectedBlock.type === 'divider' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Thickness</label>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={selectedBlock.thickness ?? 2}
                      onChange={(event) =>
                        onUpdateBlock(selectedBlock.id, { thickness: Number(event.target.value) })
                      }
                      className="mt-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Color</label>
                    <input
                      type="color"
                      value={selectedBlock.color || '#cbd5f5'}
                      onChange={(event) => handleColorChange(event.target.value)}
                      className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
                    />
                  </div>
                </div>
              ) : null}

              {selectedBlock.type === 'layout' ? (
                <div className="space-y-4">
                  {selectedBlock.layoutType === 'spacer' ? (
                    <div>
                      <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Spacer height</label>
                      <input
                        type="range"
                        min={16}
                        max={160}
                        value={selectedBlock.height ?? 48}
                        onChange={(event) =>
                          onUpdateBlock(selectedBlock.id, { height: Number(event.target.value) })
                        }
                        className="mt-2 w-full"
                      />
                      <p className="text-xs text-slate-500">{selectedBlock.height ?? 48}px</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Row &amp; Column placeholders are cosmetic for now -- nested content coming soon.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-6 text-center text-xs text-slate-400">
              Select a block on the canvas to edit its properties. Styling controls will appear here.
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}
