import { NextResponse } from 'next/server';
import { createOtp, isValidIranPhone } from '@/lib/otp';
import { checkAndConsumeOtpRequest } from '@/lib/rate';
import { sendOtp } from '@/lib/notify';
import { getUsers } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { phone } = body as { phone?: string };
  if (!phone || !isValidIranPhone(phone)) return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });
  // rate limit per phone
  const rl = await checkAndConsumeOtpRequest(phone);
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate_limited', retryAfterSec: rl.retryAfterSec }, { status: 429 });
  }
  // optional: block if phone already registered? We allow signup but client can show later
  const users = await getUsers();
  if (users.some((u) => (u.phone || '').replace(/\D/g, '') === phone.replace(/\D/g, ''))) {
    // still send code to verify ownership; frontend can branch to login
  }
  const { code } = await createOtp(phone, 'signup');
  try {
    await sendOtp(phone, code, 5);
  } catch {}
  return NextResponse.json({ ok: true });
}
