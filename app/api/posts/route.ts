import { NextResponse } from 'next/server';
import { listPosts, createPost } from '@/lib/cms';
import { requireUser } from '@/lib/session';

export async function GET() {
  const items = (await listPosts()).filter((p) => p.published);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await requireUser('admin');
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { title, slug, content, published } = body as any;
  if (!title || !slug || !content) return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  const post = await createPost({ title, slug, content, published });
  return NextResponse.json({ ok: true, item: post });
}

