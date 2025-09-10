import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';

export async function POST(req: Request) {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { dryRun = true } = body as { dryRun?: boolean };

  const provider = process.env.SMS_PROVIDER || 'mock';
  let missing: string[] = [];
  if (provider === 'smsir_ultrafast') {
    if (!process.env.SMSIR_API_KEY) missing.push('SMSIR_API_KEY');
    if (!process.env.SMSIR_TEMPLATE_ID) missing.push('SMSIR_TEMPLATE_ID');
  } else if (provider === 'smsir') {
    if (!process.env.SMSIR_API_KEY) missing.push('SMSIR_API_KEY');
    if (!process.env.SMSIR_SEND_URL) missing.push('SMSIR_SEND_URL');
  }

  if (dryRun) {
    return NextResponse.json({ ok: missing.length === 0, provider, missing });
  }

  // Non-dry tests are disabled by default to avoid real charges
  return NextResponse.json({ ok: false, error: 'non_dry_run_disabled' }, { status: 400 });
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const provider = process.env.SMS_PROVIDER || 'mock';
  const missing: string[] = [];
  if (provider === 'smsir_ultrafast') {
    if (!process.env.SMSIR_API_KEY) missing.push('SMSIR_API_KEY');
    if (!process.env.SMSIR_TEMPLATE_ID) missing.push('SMSIR_TEMPLATE_ID');
  } else if (provider === 'smsir') {
    if (!process.env.SMSIR_API_KEY) missing.push('SMSIR_API_KEY');
    if (!process.env.SMSIR_SEND_URL) missing.push('SMSIR_SEND_URL');
  }
  return NextResponse.json({ ok: missing.length === 0, provider, missing, mode: 'dryRun' });
}
