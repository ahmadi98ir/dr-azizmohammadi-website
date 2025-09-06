import { NextResponse } from 'next/server';
import { getAppointments, saveAppointments } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { Appointment } from '@/lib/types';
import { uid, toISO } from '@/lib/utils';
import { sendEmail, sendSMS } from '@/lib/notify';

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const all = await getAppointments();
  const list = user.role === 'admin' ? all : all.filter((a) => a.patientId === user.id);
  return NextResponse.json({ items: list.sort((a, b) => a.date.localeCompare(b.date)) });
}

export async function POST(req: Request) {
  const user = await requireUser('patient');
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { date, type, note } = body as { date?: string; type?: 'visit' | 'consult'; note?: string };
  if (!date || !type) return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  const all = await getAppointments();
  // simple overlap check for user: one appointment per 60 minutes window
  const when = new Date(date).getTime();
  const has = all.some(
    (a) => a.patientId === user.id && Math.abs(new Date(a.date).getTime() - when) < 60 * 60 * 1000,
  );
  if (has) return NextResponse.json({ error: 'overlap' }, { status: 409 });
  const appt: Appointment = {
    id: uid('a_'),
    patientId: user.id,
    date: toISO(date),
    type: type,
    status: 'pending',
    note,
    createdAt: toISO(Date.now()),
  };
  await saveAppointments([...all, appt]);
  await sendEmail(
    user.email,
    'ثبت نوبت جدید',
    `کاربر گرامی ${user.name}\n\nنوبت شما ثبت شد و در انتظار تایید است.\nشناسه نوبت: ${appt.id}\nتاریخ: ${new Date(appt.date).toLocaleString('fa-IR')}`,
  );
  if (user.phone) {
    try {
      await sendSMS(
        user.phone,
        `کلینیک دکتر عزیزمحمدی\nنوبت شما ثبت شد و در انتظار تایید است.\nکد: ${appt.id}\n${new Date(appt.date).toLocaleString('fa-IR')}`,
      );
    } catch {}
  }
  return NextResponse.json({ ok: true, item: appt });
}
