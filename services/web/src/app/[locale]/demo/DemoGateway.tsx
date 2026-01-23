'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { prefixPathWithLocale } from '@/lib/locale-shared';

type DemoGatewayProps = {
  locale: string;
  formLabel: string;
  placeholder: string;
  submitLabel: string;
};

export default function DemoGateway({ locale, formLabel, placeholder, submitLabel }: DemoGatewayProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Please enter the password provided to you.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/demo/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? 'Unable to find a matching demo.');
        return;
      }

      const { slug } = (await response.json()) as { slug: string };
      router.push(prefixPathWithLocale(locale, `/demo/${slug}`));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="w-full max-w-lg space-y-4 text-left" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold text-white/80">
        {formLabel}
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-lg text-white outline-none transition focus:border-white/80"
          aria-invalid={Boolean(error)}
        />
      </label>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-2xl bg-gradient-to-r from-white to-white/70 px-6 py-3 text-lg font-semibold text-black transition hover:brightness-110"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Checking...' : submitLabel}
      </button>
    </form>
  );
}
