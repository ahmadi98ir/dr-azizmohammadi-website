import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST() {
  const store = await cookies();
  const token = store.get('session_token')?.value;
  if (token) await deleteSession(token);
  const res = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  // In route handlers, cookies() is per-request; we can clear via response cookie
  res.cookies.set('session_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}

export const dynamic = 'force-dynamic';
