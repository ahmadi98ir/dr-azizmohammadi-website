import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { updatePayment, getPayment } from '@/lib/payments';
import { getAppointments, saveAppointments, getUsers } from '@/lib/db';

export async function PATCH(req: Request, { params }: any) {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const status = (body?.status || '').trim();
  if (!['paid', 'failed', 'cancelled'].includes(status)) return NextResponse.json({ error: 'invalid_status' }, { status: 400 });

  const p = await updatePayment(params.id, { status, paidAt: status === 'paid' ? new Date().toISOString() : undefined });
  if (!p) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // If paid, set appointment to approved
  if (status === 'paid') {
    const appts = await getAppointments();
    const idx = appts.findIndex((a) => a.id === p.appointmentId);
    if (idx !== -1) {
      appts[idx] = { ...appts[idx], status: 'approved' } as any;
      await saveAppointments(appts);
    }
  }
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';
