import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { getUsers } from '@/lib/db';

export async function GET() {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const users = await getUsers();
  const rows = [
    ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
    ...users.map((u) => [u.id, u.name, u.email, u.phone || '', u.role, u.createdAt]),
  ];
  const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="users.csv"',
    },
  });
}

function escapeCsv(v: any) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export const dynamic = 'force-dynamic';

