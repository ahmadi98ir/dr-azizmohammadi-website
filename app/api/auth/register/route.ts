import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/db';
import { isEmail } from '@/lib/utils';
import { createSession } from '@/lib/session';
import { User } from '@/lib/types';
import { uid, toISO } from '@/lib/utils';
import { consumeTicket } from '@/lib/otp';
import { sameOriginOk } from '@/lib/security';

export async function POST(req: Request) {
  if (!sameOriginOk(req)) return NextResponse.json({ error: 'forbidden_origin' }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { name, email, phone, password, otpTicket } = body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    otpTicket?: string;
  };
  if (!name || !phone || !otpTicket) {
    return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  }
  // Verify OTP ticket and match phone
  const ticket = await consumeTicket(otpTicket, 'signup');
  if (!ticket.ok || ticket.phone !== phone) {
    return NextResponse.json({ error: 'otp_required' }, { status: 403 });
  }
  const users = await getUsers();
  if (email && users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ error: 'email_exists' }, { status: 409 });
  }
  if (users.find((u) => (u.phone || '').replace(/\D/g, '') === String(phone).replace(/\D/g, ''))) {
    return NextResponse.json({ error: 'phone_exists' }, { status: 409 });
  }
  const user: User = {
    id: uid('u_'),
    name,
    email: email || undefined,
    phone,
    role: 'patient',
    
    createdAt: toISO(Date.now()),
  };
  users.push(user);
  await saveUsers(users);

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
