import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { email, password } = body as { email?: string; password?: string };
  if (!email || !password) return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  const users = await getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  const ok = await verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!ok) return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
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
