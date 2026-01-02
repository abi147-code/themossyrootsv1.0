import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: 'Sign up | The Mossy Roots',
  description: 'Create your TMR workspace with the serene Mossy Roots experience.',
  alternates: { canonical: 'https://themossyroots.com/signup' },
};

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--signup-font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--signup-font-playfair',
  display: 'swap',
});

export default function SignupPage() {
  return <SignupClient fontClassName={`${inter.variable} ${playfair.variable}`} />;
}
