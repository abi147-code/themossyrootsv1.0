'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const trialDays = Number(process.env.NEXT_PUBLIC_TRIAL_DAYS ?? '14');

type SignupResponse = {
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

export default function SignupPage() {
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
      name: (formData.get('name') ?? '').toString(),
      organizationName: (formData.get('organizationName') ?? '').toString(),
    };

    try {
      const response = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { message?: string };
        setError(errorBody.message || 'Unable to sign up.');
        setLoading(false);
        return;
      }

      const data = (await response.json()) as SignupResponse;
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
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800/70 bg-slate-950/80 p-10 shadow-xl shadow-emerald-900/60">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">{trialDays}-day free trial</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Create your TMR workspace</h1>
          <p className="mt-2 text-sm text-slate-300">Spin up CRM, billing, and marketing workflows in a single stack.</p>
        </div>
        <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-1">
            <label htmlFor="name" className="block text-sm font-medium text-slate-200">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Jordan Moss"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="organizationName" className="block text-sm font-medium text-slate-200">
              Organization
            </label>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Mossy Roots Agency"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="you@company.com"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="sm:col-span-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>
          ) : null}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {loading ? 'Creating account…' : 'Create workspace'}
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">
              We start a {trialDays}-day trial immediately. Upgrade inside the dashboard when you are ready.
            </p>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link className="font-semibold text-emerald-300 hover:text-emerald-200" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
