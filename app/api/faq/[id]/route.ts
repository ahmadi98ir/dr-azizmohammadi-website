import { NextResponse } from 'next/server';
import { updateFaq, deleteFaq } from '@/lib/cms';
import { requireUser } from '@/lib/session';

export async function PATCH(req: Request, { params }: any) {
  const user = await requireUser('admin');
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const item = await updateFaq(params.id, body as any);
  if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_: Request, { params }: any) {
  const user = await requireUser('admin');
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ok = await deleteFaq(params.id);
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';

