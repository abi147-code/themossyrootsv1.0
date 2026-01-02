import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Log in | The Mossy Roots',
  description: 'Access your TMR workspace with the serene Mossy Roots experience.',
  alternates: { canonical: 'https://themossyroots.com/login' },
};

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--login-font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--login-font-playfair',
  display: 'swap',
});

export default function LoginPage() {
  return <LoginClient fontClassName={`${inter.variable} ${playfair.variable}`} />;
}
