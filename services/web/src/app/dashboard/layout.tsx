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
  { href: '/dashboard/invoices', label: 'Invoices' },
  { href: '/dashboard/history', label: 'History' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, loading, refresh, logout } = useAuth();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);

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

  const sidebarWidth = navCollapsed ? 'w-16' : 'w-56';
  const contentOffset = navCollapsed ? 'pl-16' : 'pl-56';
  const navWidthValue = navCollapsed ? '4rem' : '14rem';

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      style={{ '--nav-width': navWidthValue } as CSSProperties}
    >
      <aside
        className={clsx(
          'fixed left-0 top-0 z-40 flex h-full flex-col justify-between overflow-hidden border-r border-slate-800 bg-slate-950/95 text-slate-100 shadow-[0_20px_45px_rgba(2,6,23,0.6)] transition-all duration-300',
          sidebarWidth
        )}
        style={{ width: navWidthValue } as CSSProperties}
      >
        <div className={clsx('px-4 pt-6 transition-opacity duration-200', navCollapsed && 'opacity-0 pointer-events-none')}>
          <p className="text-[10px] uppercase tracking-[0.4em] text-sky-400/70">Tools</p>
          <h2 className="mt-3 text-lg font-semibold text-white">Dashboard</h2>
        </div>
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-2 py-6">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'group flex items-center overflow-hidden rounded-xl border py-2 text-xs font-semibold uppercase tracking-[0.35em] transition',
                  navCollapsed ? 'justify-center gap-0 px-0' : 'justify-start gap-3 px-3',
                  isActive
                    ? 'border-sky-500/60 bg-sky-500/15 text-sky-200 shadow-[0_10px_25px_rgba(56,189,248,0.25)]'
                    : 'border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900/70 hover:text-slate-200'
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900/70 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-300">
                  {item.label.slice(0, 1)}
                </span>
                <span
                  className={clsx(
                    'whitespace-nowrap text-[11px] tracking-[0.4em] transition-all duration-200',
                    navCollapsed ? 'pointer-events-none w-0 opacity-0' : 'w-auto opacity-100'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800/80 px-3 py-4">
          <button
            type="button"
            onClick={() => setNavCollapsed((prev) => !prev)}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900/70 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-300 transition hover:border-sky-500 hover:text-white',
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
            className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-800/80 bg-slate-950/70 px-6 py-5 shadow-lg shadow-slate-950/40 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-sky-400/70">Welcome</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                {user?.name || user?.email?.split('@')[0] || 'builder'}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="https://dashboard.stripe.com/test/subscriptions"
                className="text-xs font-semibold text-sky-300 transition hover:text-sky-200"
              >
                Manage Stripe subscription &rarr;
              </Link>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-600/50 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-400 transition hover:border-rose-400/60 hover:text-rose-300"
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
