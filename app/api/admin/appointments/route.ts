import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { getAppointments } from '@/lib/db';
import { getUsers } from '@/lib/db';

export async function GET(req: Request) {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10) || 20));

  const prisma = await getPrisma();
  if (prisma) {
    const where: any = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { id: { contains: q } },
        { note: { contains: q } },
        { patientId: { contains: q } },
        { patient: { name: { contains: q } } },
        { patient: { email: { contains: q } } },
      ];
    }
    const [total, raw] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        include: { patient: true },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const items = raw.map((a: any) => ({
      id: a.id,
      patientId: a.patientId ?? undefined,
      patientName: a.patient?.name || '',
      patientEmail: a.patient?.email || '',
      date: new Date(a.date).toISOString(),
      type: a.type,
      status: a.status,
      note: a.note ?? undefined,
      createdAt: new Date(a.createdAt).toISOString(),
    }));
    const pages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({ items, page, pages, total });
  }

  // JSON fallback
  const [all, users] = await Promise.all([getAppointments(), getUsers()]);
  let list = all;
  if (status) list = list.filter((a) => a.status === status);
  if (q) {
    const ql = q.toLowerCase();
    list = list.filter((a) => {
      const u = users.find((x) => x.id === a.patientId);
      return (
        a.id.includes(q) ||
        (a.patientId || '').includes(q) ||
        (a.note || '').includes(q) ||
        (u?.name || '').toLowerCase().includes(ql) ||
        (u?.email || '').toLowerCase().includes(ql)
      );
    });
  }
  list = list.sort((a, b) => b.date.localeCompare(a.date));
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const slice = list.slice((page - 1) * limit, (page - 1) * limit + limit);
  const items = slice.map((a) => ({ ...a }));
  return NextResponse.json({ items, page, pages, total });
}

export const dynamic = 'force-dynamic';
