import { cookies } from 'next/headers';

export function setDemoAccessCookie(slug: string) {
  const cookieName = `demo_access_granted_${slug}`;
  cookies().set({
    name: cookieName,
    value: slug,
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict',
  });
}
