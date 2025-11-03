'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

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
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/70 bg-slate-950/80 p-8 shadow-xl shadow-sky-950/50">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-400/70">The Mossy Roots</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-300">Log back into your TMR workspace.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an account?{' '}
          <Link className="font-semibold text-sky-300 hover:text-sky-200" href="/signup">
            Start the free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
