import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: Request) {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10) || 20));
  const prisma = await getPrisma();
  if (prisma) {
    const [total, items] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    ]);
    return NextResponse.json({
      items: items.map((x: any) => ({ id: x.id, actorId: x.actorId, action: x.action, resource: x.resource, meta: x.meta, createdAt: x.createdAt.toISOString() })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  }
  // JSON fallback
  const file = path.join(process.cwd(), 'data', 'audit.json');
  let arr: any[] = [];
  try { arr = JSON.parse(await fs.readFile(file, 'utf8')); } catch {}
  const total = arr.length;
  const slice = arr.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice((page - 1) * limit, (page - 1) * limit + limit);
  return NextResponse.json({ items: slice, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}

export const dynamic = 'force-dynamic';

