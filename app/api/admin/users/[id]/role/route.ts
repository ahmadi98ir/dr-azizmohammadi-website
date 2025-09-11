import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { getUsers, saveUsers } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const role = (body?.role || '').trim();
  if (!['admin', 'patient'].includes(role)) return NextResponse.json({ error: 'invalid_role' }, { status: 400 });

  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const current = users[idx];
  // Prevent removing the last admin
  const adminCount = users.filter((u) => u.role === 'admin').length;
  if (current.role === 'admin' && role !== 'admin' && adminCount <= 1) {
    return NextResponse.json({ error: 'cannot_remove_last_admin' }, { status: 400 });
  }

  users[idx] = { ...current, role: role as any };
  await saveUsers(users);
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';

