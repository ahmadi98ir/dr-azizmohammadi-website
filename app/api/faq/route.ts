import { NextResponse } from 'next/server';
import { listFaq, createFaq } from '@/lib/cms';
import { requireUser } from '@/lib/session';

export async function GET() {
  const items = await listFaq();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await requireUser('admin');
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { question, answer } = body as any;
  if (!question || !answer) return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  const item = await createFaq({ question, answer });
  return NextResponse.json({ ok: true, item });
}

