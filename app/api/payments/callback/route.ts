import { NextResponse } from 'next/server';
import { getPayment, updatePayment } from '@/lib/payments';
import { getAppointments, saveAppointments } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('paymentId');
  const status = searchParams.get('status'); // 'ok' | 'fail'
  if (!paymentId) return NextResponse.json({ error: 'invalid_payment' }, { status: 400 });
  const payment = await getPayment(paymentId);
  if (!payment) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (status === 'ok') {
    await updatePayment(payment.id, { status: 'paid', paidAt: new Date().toISOString() });
    const appts = await getAppointments();
    const idx = appts.findIndex((a) => a.id === payment.appointmentId);
    if (idx !== -1) {
      appts[idx] = { ...appts[idx], status: 'approved' } as any;
      await saveAppointments(appts);
    }
    return NextResponse.redirect(new URL(`/dashboard/appointments`, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  } else {
    await updatePayment(payment.id, { status: 'failed' });
    return NextResponse.redirect(new URL(`/dashboard/appointments`, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
}

