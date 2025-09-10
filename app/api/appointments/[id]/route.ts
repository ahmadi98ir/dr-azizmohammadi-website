import { NextResponse } from 'next/server';
import { getAppointments, saveAppointments, getUsers } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { sendEmail } from '@/lib/notify';

export async function GET(_: Request, { params }: any) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const all = await getAppointments();
  const item = all.find((a) => a.id === params.id);
  if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (user.role !== 'admin' && item.patientId !== user.id)
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  return NextResponse.json({ item });
}

export async function PATCH(req: Request, { params }: any) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const all = await getAppointments();
  const idx = all.findIndex((a) => a.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const item = all[idx];
  if (user.role !== 'admin' && item.patientId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { status, date, note } = body as { status?: string; date?: string; note?: string };
  if (user.role !== 'admin' && status && status !== 'cancelled')
    return NextResponse.json({ error: 'forbidden_status' }, { status: 403 });
  const updated = { ...item };
  if (typeof note === 'string') updated.note = note;
  if (typeof date === 'string' && user.role === 'admin') updated.date = new Date(date).toISOString();
  if (typeof status === 'string') updated.status = status as any;
  all[idx] = updated;
  await saveAppointments(all);
  // notify patient on admin status change
  if (user.role === 'admin' && status && status !== item.status) {
    const users = await getUsers();
    const patient = users.find((u) => u.id === item.patientId);
    if (patient) {
      await sendEmail(
        patient.email,
        'به‌روزرسانی وضعیت نوبت',
        `کاربر گرامی ${patient.name}\n\nوضعیت نوبت شما به «${status}» تغییر یافت.\nشناسه نوبت: ${item.id}`,
      );
    }
  }
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(_: Request, { params }: any) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const all = await getAppointments();
  const idx = all.findIndex((a) => a.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const item = all[idx];
  if (user.role !== 'admin' && item.patientId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  all.splice(idx, 1);
  await saveAppointments(all);
  return NextResponse.json({ ok: true });
}
