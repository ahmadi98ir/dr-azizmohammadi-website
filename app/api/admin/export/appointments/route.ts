import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { getAppointments, getUsers } from '@/lib/db';

export async function GET() {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const [appts, users] = await Promise.all([getAppointments(), getUsers()]);
  const rows = [
    ['id', 'patientId', 'patientName', 'patientEmail', 'date', 'type', 'status', 'note', 'createdAt'],
    ...appts.map((a) => {
      const u = users.find((x) => x.id === a.patientId);
      return [a.id, a.patientId, u?.name || '', u?.email || '', a.date, a.type, a.status, a.note || '', a.createdAt];
    }),
  ];
  const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="appointments.csv"',
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

