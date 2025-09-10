import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { sameOriginOk } from '@/lib/security';

import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const loginRateFile = path.join(process.cwd(), 'data', 'login_rate.json');
async function readLoginRate(): Promise<Record<string, { windowStart: number; count: number }>> {
  try { const t = await readFile(loginRateFile, 'utf8'); return JSON.parse(t); } catch { return {}; }
}
async function saveLoginRate(d: any) { await mkdir(path.dirname(loginRateFile), { recursive: true }); await writeFile(loginRateFile, JSON.stringify(d, null, 2), 'utf8'); }

export async function POST(req: Request) {
  if (!sameOriginOk(req)) return NextResponse.json({ error: 'forbidden_origin' }, { status: 403 });
  // Throttle by email/IP (simple windowed rate limit)
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'ip:unknown';
  const bodyTxt = await req.text().catch(() => '');
  let body: any = null;
  try { body = JSON.parse(bodyTxt || '{}'); } catch { body = null; }
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { email, password } = body as { email?: string; password?: string };
  const key = `e:${(email||'').toLowerCase()}` || `ip:${ip}`;
  const store = await readLoginRate();
  const WINDOW = 10 * 60 * 1000; // 10m
  const LIMIT = Number(process.env.LOGIN_MAX_ATTEMPTS || 20);
  const now = Date.now();
  const rec = store[key] || { windowStart: now, count: 0 };
  if (now - rec.windowStart > WINDOW) { rec.windowStart = now; rec.count = 0; }
  if (rec.count >= LIMIT) {
    const retryAfterSec = Math.max(1, Math.ceil((rec.windowStart + WINDOW - now) / 1000));
    return NextResponse.json({ error: 'rate_limited', retryAfterSec }, { status: 429 });
  }
  rec.count += 1; store[key] = rec; await saveLoginRate(store);
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
