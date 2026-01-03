'use client';

import Link from 'next/link';

export function AuthExitButton() {
  return (
    <Link
      href="/"
      aria-label="Back to home"
      className="auth-exit-button"
    >
      <svg
        className="auth-exit-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="M11 6l-6 6 6 6" />
      </svg>
    </Link>
  );
}
