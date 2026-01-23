import { NextResponse } from 'next/server';
import { findDemoByPassword } from '@/lib/demo-config';
import { setDemoAccessCookie } from '@/lib/demo-access';

export async function POST(request: Request) {
  let body: { password?: string } = {};

  try {
    body = await request.json();
  } catch {
    // ignore parse failure
  }

  const password = typeof body?.password === 'string' ? body.password.trim() : '';
  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  const demo = findDemoByPassword(password);
  if (!demo) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  setDemoAccessCookie(demo.slug);

  return NextResponse.json({ slug: demo.slug });
}
