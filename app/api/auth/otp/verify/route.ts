import { NextResponse } from 'next/server';
import { verifyOtp, isValidIranPhone } from '@/lib/otp';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { phone, code } = body as { phone?: string; code?: string };
  if (!phone || !code || !isValidIranPhone(phone)) return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  const res = await verifyOtp(phone, code, 'signup');
  if (!('ok' in res) || !res.ok) return NextResponse.json({ error: res.error || 'invalid_code' }, { status: 400 });
  return NextResponse.json({ ok: true, ticket: res.ticket });
}

