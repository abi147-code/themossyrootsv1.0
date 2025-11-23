import Link from "next/link";

const iframeSrc =
  process.env.NEXT_PUBLIC_INVOICE_GENERATOR_URL ?? "http://localhost:5173";

export default function InvoiceGeneratorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="p-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          Exit Tool
        </Link>
      </div>
      <div className="flex-1 min-h-0">
        <iframe
          src={iframeSrc}
          title="Invoice Generator"
          className="h-full w-full border-0"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
