import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getPrisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  const checks: Record<string, any> = {};
  let ok = true;

  // Base info
  const info = {
    time: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
    node: process.version,
    commit: process.env.SOURCE_COMMIT || '',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
    provider: process.env.SMS_PROVIDER || 'mock',
    storage: process.env.USE_PRISMA === '1' ? 'prisma' : 'json',
  };

  // Prisma connectivity (if enabled)
  try {
    const prisma = await getPrisma();
    if (prisma) {
      await prisma.user.count();
      checks.prisma = { ok: true };
    } else {
      checks.prisma = { ok: process.env.USE_PRISMA !== '1', skipped: process.env.USE_PRISMA !== '1' };
    }
  } catch (e: any) {
    ok = false;
    checks.prisma = { ok: false, error: e?.message || String(e) };
  }

  // Filesystem checks
  const dataDir = path.join(process.cwd(), 'data');
  const prismaDir = path.join(process.cwd(), 'prisma');
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const p = path.join(dataDir, 'health.tmp');
    await fs.writeFile(p, String(Date.now()), 'utf8');
    await fs.unlink(p).catch(() => {});
    checks.fsData = { ok: true, path: dataDir };
  } catch (e: any) {
    ok = false;
    checks.fsData = { ok: false, error: e?.message || String(e) };
  }
  try {
    await fs.mkdir(prismaDir, { recursive: true });
    checks.fsPrisma = { ok: true, path: prismaDir };
  } catch (e: any) {
    checks.fsPrisma = { ok: false, error: e?.message || String(e) };
  }

  // SMS configuration
  const provider = process.env.SMS_PROVIDER || 'mock';
  if (provider === 'smsir_ultrafast') {
    const missing = [
      process.env.SMSIR_API_KEY ? null : 'SMSIR_API_KEY',
      process.env.SMSIR_TEMPLATE_ID ? null : 'SMSIR_TEMPLATE_ID',
    ].filter(Boolean) as string[];
    checks.sms = { ok: missing.length === 0, provider, missing };
    if (missing.length) ok = false;
  } else if (provider === 'smsir') {
    const missing = [
      process.env.SMSIR_API_KEY ? null : 'SMSIR_API_KEY',
      process.env.SMSIR_SEND_URL ? null : 'SMSIR_SEND_URL',
    ].filter(Boolean) as string[];
    checks.sms = { ok: missing.length === 0, provider, missing, line: process.env.SMSIR_LINE_NUMBER || '' };
    if (missing.length) ok = false;
  } else {
    checks.sms = { ok: true, provider };
  }

  const tookMs = Date.now() - start;
  return NextResponse.json({ ok, info, checks, tookMs });
}

