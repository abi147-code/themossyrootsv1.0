'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import DotGrid from '@/components/DotGrid';
import VisibilityMount from '@/components/VisibilityMount';

type LoginResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    name?: string;
    role?: 'ADMIN' | 'USER';
  };
  subscription?: {
    status: string;
    plan: string;
    trialEndsAt?: string;
  } | null;
  message?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login, refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: (formData.get('email') ?? '').toString(),
      password: (formData.get('password') ?? '').toString(),
    };

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { message?: string };
        setError(errorBody.message || 'Unable to log in.');
        setLoading(false);
        return;
      }

      const data = (await response.json()) as LoginResponse;
      await login(data);
      await refresh(data.token);
      router.replace('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Unexpected error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f7f9fc] px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        <VisibilityMount className="absolute inset-0" rootMargin="0px 0px -10% 0px" threshold={0.05}>
          <DotGrid
            className="pointer-events-none absolute inset-0"
            dotSize={12}
            gap={26}
            baseColor="#e5eef8"
            activeColor="#1f7a4d"
            proximity={160}
            speedTrigger={110}
            shockRadius={220}
            shockStrength={5}
            resistance={520}
            returnDuration={1.5}
          />
        </VisibilityMount>
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/78 to-white/90" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600/80">The Mossy Roots</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Log back into your TMR workspace.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-500/30 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Need an account?{' '}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-600" href="/signup">
            Start the free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
