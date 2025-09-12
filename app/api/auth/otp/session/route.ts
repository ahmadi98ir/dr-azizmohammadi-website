import { NextResponse } from 'next/server';
import { consumeTicket } from '@/lib/otp';
import { getUsers } from '@/lib/db';
import { createSession } from '@/lib/session';
import { sameOriginOk } from '@/lib/security';

export async function POST(req: Request) {
  if (!sameOriginOk(req)) return NextResponse.json({ error: 'forbidden_origin' }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { otpTicket, purpose } = body as { otpTicket?: string; purpose?: 'login' | 'signup' };
  if (!otpTicket) return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  const t = await consumeTicket(otpTicket, purpose === 'login' ? 'login' : 'signup');
  if (!t.ok) return NextResponse.json({ error: t.error || 'invalid_ticket' }, { status: 400 });
  const users = await getUsers();
  const phoneNorm = t.phone.replace(/\D/g, '');
  const user = users.find((u) => (u.phone || '').replace(/\D/g, '') === phoneNorm);
  if (!user) return NextResponse.json({ error: 'not_registered' }, { status: 404 });
  const token = await createSession(user.id);
  const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
  res.cookies.set('session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}

export const dynamic = 'force-dynamic';

