'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { Background3D } from '@/app/(marketing)/serene/Background3D';
import './signup.css';

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

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px' },
  transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
};

type SignupClientProps = {
  fontClassName?: string;
};

export default function SignupClient({ fontClassName = '' }: SignupClientProps) {
  const router = useRouter();
  const { login, refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className={`signup-serene-root ${fontClassName}`}>
      {mounted ? (
        <Suspense fallback={<div className="fixed inset-0 bg-[#050807]" />}>
          <Background3D scroll={scrollProgress} />
        </Suspense>
      ) : (
        <div className="fixed inset-0 bg-[#050807]" aria-hidden />
      )}

      <div className="signup-noise-overlay" aria-hidden />

      <main className="signup-main">
        <motion.div {...fadeIn} className="signup-card">
          <div className="space-y-3 text-center">
            <p className="signup-kicker">The Mossy Roots</p>
            <h1 className="signup-h1">Create your TMR workspace</h1>
            <p className="signup-lede">Spin up CRM, billing, and marketing workflows in a single stack.</p>
          </div>
          <form className="signup-form" onSubmit={handleSubmit}>
            <label className="signup-field">
              <span>Full name</span>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Jordan Moss"
              />
            </label>
            <label className="signup-field">
              <span>Organization</span>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                placeholder="Mossy Roots Agency"
              />
            </label>
            <label className="signup-field">
              <span>Email</span>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
              />
            </label>
            <label className="signup-field">
              <span>Password</span>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="********"
              />
            </label>

            {error ? (
              <p className="signup-error">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="signup-button"
            >
              {loading ? 'Creating account...' : 'Create workspace'}
            </button>
          </form>

          <p className="signup-footer-text">
            Already have an account?{' '}
            <Link className="signup-link" href="/login">
              Log in
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
