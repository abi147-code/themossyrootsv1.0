'use client';

import { ChangeEvent } from 'react';
import clsx from 'clsx';

type ToolbarProps = {
  title: string;
  onTitleChange: (value: string) => void;
  onDownload: () => void;
  onReset: () => void;
  onClearDraft: () => void;
};

export default function Toolbar({ title, onTitleChange, onDownload, onReset, onClearDraft }: ToolbarProps) {
  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value);
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800/70 bg-slate-950/80 px-6 py-5 shadow-sm shadow-slate-950/30">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-400/70">Invoice Builder</p>
        <div className="flex items-center gap-3">
          <input
            className="min-w-[220px] rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
            value={title}
            onChange={handleTitleChange}
            placeholder="Invoice title"
            aria-label="Invoice title"
          />
          <span className="text-xs text-slate-500">Rename the layout for template saving</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          className={clsx(
            'inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition',
            'hover:border-slate-500 hover:text-white'
          )}
        >
          <span className="text-lg" aria-hidden>
            ⬇️
          </span>
          Export JSON
        </button>
        <button
          type="button"
          onClick={onReset}
          className={clsx(
            'inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition',
            'hover:border-slate-500 hover:text-white'
          )}
        >
          <span className="text-lg" aria-hidden>
            🔄
          </span>
          Reset
        </button>
        <button
          type="button"
          onClick={onClearDraft}
          className="inline-flex items-center justify-center rounded-lg border border-rose-500/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200 transition hover:border-rose-400 hover:text-rose-100"
        >
          Clear draft
        </button>
      </div>
    </header>
  );
}
