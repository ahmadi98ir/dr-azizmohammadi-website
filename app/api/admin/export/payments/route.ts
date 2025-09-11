import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { listPayments } from '@/lib/payments';
import { getAppointments, getUsers } from '@/lib/db';

export async function GET() {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const [payments, appts, users] = await Promise.all([listPayments(), getAppointments(), getUsers()]);
  const rows = [
    ['id', 'appointmentId', 'patientName', 'patientEmail', 'amount', 'status', 'createdAt', 'paidAt'],
    ...payments.map((p) => {
      const a = appts.find((x) => x.id === p.appointmentId);
      const u = users.find((x) => x.id === (a?.patientId || ''));
      return [p.id, p.appointmentId, u?.name || '', u?.email || '', p.amount, p.status, p.createdAt || '', p.paidAt || ''];
    }),
  ];
  const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="payments.csv"',
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

