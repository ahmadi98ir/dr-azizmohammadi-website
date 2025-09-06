import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { sendSMS } from '@/lib/notify';

export async function POST(req: Request) {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { to, message } = body as { to?: string; message?: string };
  if (!to || !message) return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  const id = await sendSMS(to, message);
  return NextResponse.json({ ok: true, id });
}

