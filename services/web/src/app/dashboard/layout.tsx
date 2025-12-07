'use client';

import { ReactNode, useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

type DashboardLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/invoice-generator', label: 'Invoice Generator' },
  { href: '/dashboard/history', label: 'History' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, loading, refresh, logout } = useAuth();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const isInvoiceTool = pathname.startsWith('/dashboard/invoice-generator');

  useEffect(() => {
    const updateHeaderOffset = () => {
      const height = headerRef.current?.offsetHeight ?? 0;
      const padding = 24; // space between header and palette
      document.documentElement.style.setProperty(
        '--dashboard-header-offset',
        `${height + padding}px`
      );
    };
    updateHeaderOffset();
    window.addEventListener('resize', updateHeaderOffset);
    return () => window.removeEventListener('resize', updateHeaderOffset);
  }, []);

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;
    refresh();
  }, [token, refresh]);

  if (loading || !token) {
    return null;
  }

  if (isInvoiceTool) {
    return (
      <div className="dashboard-light flex h-screen w-full flex-col overflow-hidden bg-[#f7f9fc] text-slate-900">
        {children}
      </div>
    );
  }

  const sidebarWidth = navCollapsed ? 'w-16' : 'w-64';
  const contentOffset = navCollapsed ? 'pl-16' : 'pl-64';
  const navWidthValue = navCollapsed ? '4rem' : '16rem';

  return (
    <div
      className="dashboard-light min-h-screen bg-[#f7f9fc] text-slate-900"
      style={{ '--nav-width': navWidthValue } as CSSProperties}
    >
      <aside
        className={clsx(
          'fixed left-0 top-0 z-40 flex h-full flex-col justify-between overflow-hidden border-r border-slate-200 bg-white/95 text-slate-900 shadow-[0_14px_40px_rgba(15,23,42,0.1)] transition-all duration-300',
          sidebarWidth
        )}
        style={{ width: navWidthValue } as CSSProperties}
      >
        <div className={clsx('px-4 pt-6 transition-opacity duration-200', navCollapsed && 'opacity-0 pointer-events-none')}>
          <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-600/80">Tools</p>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Dashboard</h2>
        </div>
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 py-6">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'group flex w-full items-center rounded-xl border text-xs font-semibold uppercase tracking-[0.35em] transition',
                  navCollapsed ? 'justify-center gap-0 px-2 py-2' : 'justify-start gap-2 px-3 py-3',
                  isActive
                    ? 'border-emerald-500/60 bg-emerald-50 text-emerald-700 shadow-[0_10px_25px_rgba(16,185,129,0.18)]'
                    : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                )}
                aria-label={item.label}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-600">
                  {item.label.slice(0, 1)}
                </span>
                {!navCollapsed ? (
                  <span className="flex-1 whitespace-nowrap text-[11px] tracking-[0.4em] transition-all duration-200">
                    {item.label}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 px-3 py-4">
          <button
            type="button"
            onClick={() => setNavCollapsed((prev) => !prev)}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700',
              navCollapsed ? 'h-9 w-9 px-0' : 'h-9 w-full px-3'
            )}
            aria-expanded={!navCollapsed}
            title={navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <span
              className={clsx(
                'transition-transform duration-300',
                navCollapsed ? 'rotate-180' : 'rotate-0'
              )}
              aria-hidden
            >
              ‹
            </span>
            {navCollapsed ? <span className="sr-only">Expand</span> : <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div
        className={clsx(
          'min-h-screen w-full transition-all duration-300',
          contentOffset
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-8 px-4 py-10 lg:px-8">
          <header
            ref={headerRef}
            className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 px-6 py-5 shadow-lg shadow-slate-200/80 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-600/80">Welcome</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                {user?.name || user?.email?.split('@')[0] || 'builder'}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="https://dashboard.stripe.com/test/subscriptions"
                className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-600"
              >
                Manage Stripe subscription &rarr;
              </Link>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-600 transition hover:border-rose-200 hover:text-rose-500"
              >
                Log out
              </button>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
