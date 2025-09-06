import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { createPayment } from '@/lib/payments';
import { getAppointments, saveAppointments } from '@/lib/db';

export async function POST(req: Request) {
  const user = await requireUser('patient');
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { appointmentId, amount } = body as { appointmentId?: string; amount?: number };
  if (!appointmentId || !amount || amount <= 0) return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  const appts = await getAppointments();
  const appt = appts.find((a) => a.id === appointmentId);
  if (!appt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (appt.patientId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const payment = await createPayment(appt.id, Math.round(amount));
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  // Simulated gateway redirect
  const redirectUrl = `${base}/payments/mock?paymentId=${payment.id}`;
  return NextResponse.json({ ok: true, paymentId: payment.id, redirectUrl });
}

