import { NextResponse } from 'next/server';
import { getDemoConfig, normalizeDemoPassword } from '@/lib/demo-config';
import { setDemoAccessCookie } from '@/lib/demo-access';

type Params = {
  params: {
    'client-slug': string;
  };
};

export async function POST(_: Request, { params }: Params) {
  const slug = params['client-slug'];
  const demoConfig = getDemoConfig(slug);

  if (!demoConfig) {
    return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
  }

  let body: { password?: string } = {};

  try {
    body = await _.json();
  } catch {
    // ignore parse errors
  }

  const password = typeof body?.password === 'string' ? body.password.trim() : '';
  const normalizedPassword = normalizeDemoPassword(password);
  const normalizedExpected = normalizeDemoPassword(demoConfig.password);

  if (!normalizedPassword || normalizedPassword !== normalizedExpected) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  setDemoAccessCookie(slug);

  return NextResponse.json({ success: true });
}
