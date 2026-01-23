'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDeviceType, pushDemoEvent } from '@/lib/demo-events';

type LockedViewProps = {
  clientSlug: string;
  brandName: string;
};

export default function LockedView({ clientSlug, brandName }: LockedViewProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    pushDemoEvent('demo_page_view', {
      client_slug: clientSlug,
      device_type: getDeviceType(),
    });
  }, [clientSlug]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password.trim()) {
      setError('Please enter the password we shared with you.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    let finished = false;

    try {
      const response = await fetch(`/api/demo/${clientSlug}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (response.ok) {
        finished = true;
        pushDemoEvent('demo_access_granted', { client_slug: clientSlug });
        router.refresh();
        return;
      }

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? 'Incorrect password.');
    } finally {
      if (!finished) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section className="flex min-h-[70vh] flex-col justify-center gap-10 px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-white/60">Private demo</p>
        <h1 className="text-3xl font-semibold leading-[1.2] md:text-5xl">
          Private preview for {brandName}
        </h1>
        <p className="text-lg text-white/70">
          Enter the access code we shared with you, then explore the full mock-up crafted for your
          brand. No login. Just your password.
        </p>
      </div>

      <form
        className="mx-auto w-full max-w-xl space-y-4 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur"
        onSubmit={handleSubmit}
      >
        <label className="block text-sm font-medium text-white/70">
          Demo password
          <input
            className="mt-2 w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-lg text-white outline-none transition focus:border-white/80"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby="demo-password-error"
          />
        </label>

        {error && (
          <p id="demo-password-error" className="text-sm text-rose-400">
            {error}
          </p>
        )}

        <button
          className="w-full rounded-2xl bg-gradient-to-r from-white to-white/70 px-6 py-3 text-center text-lg font-semibold text-black transition hover:brightness-110"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Checking...' : 'Access Demo'}
        </button>
      </form>

      <p className="mx-auto max-w-3xl text-center text-sm text-white/60">
        Your preview stays private and is never indexed. If you did not receive a password, reply to
        the outreach message or ask for a new code.
      </p>
    </section>
  );
}
