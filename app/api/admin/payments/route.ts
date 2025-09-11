import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { listPayments } from '@/lib/payments';
import { getAppointments, getUsers } from '@/lib/db';

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
        { appointmentId: { contains: q } },
        { appointment: { patient: { name: { contains: q } } } },
        { appointment: { patient: { email: { contains: q } } } },
      ];
    }
    const [total, raw] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        include: { appointment: { include: { patient: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const items = raw.map((p: any) => ({
      id: p.id,
      appointmentId: p.appointmentId,
      amount: p.amount,
      status: p.status,
      createdAt: new Date(p.createdAt).toISOString(),
      paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : undefined,
      patientName: p.appointment?.patient?.name || '',
      patientEmail: p.appointment?.patient?.email || '',
      appointmentDate: p.appointment ? new Date(p.appointment.date).toISOString() : undefined,
    }));
    const pages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({ items, page, pages, total });
  }

  // JSON fallback
  const [payments, appts, users] = await Promise.all([listPayments(), getAppointments(), getUsers()]);
  let list = payments;
  if (status) list = list.filter((p) => p.status === status);
  if (q) {
    const ql = q.toLowerCase();
    list = list.filter((p) => {
      const a = appts.find((x) => x.id === p.appointmentId);
      const u = users.find((x) => x.id === (a?.patientId || ''));
      return (
        p.id.includes(q) ||
        p.appointmentId.includes(q) ||
        (u?.name || '').toLowerCase().includes(ql) ||
        (u?.email || '').toLowerCase().includes(ql)
      );
    });
  }
  list = list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const slice = list.slice((page - 1) * limit, (page - 1) * limit + limit);
  const items = slice.map((p) => {
    const a = appts.find((x) => x.id === p.appointmentId);
    const u = users.find((x) => x.id === (a?.patientId || ''));
    return {
      id: p.id,
      appointmentId: p.appointmentId,
      amount: p.amount,
      status: p.status,
      createdAt: p.createdAt,
      paidAt: p.paidAt,
      patientName: u?.name || '',
      patientEmail: u?.email || '',
      appointmentDate: a?.date,
    };
  });
  return NextResponse.json({ items, page, pages, total });
}

export const dynamic = 'force-dynamic';

