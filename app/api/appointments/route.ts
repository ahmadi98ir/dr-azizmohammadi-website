import { NextResponse } from 'next/server';
import { getAppointments, saveAppointments } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { Appointment } from '@/lib/types';
import { uid, toISO } from '@/lib/utils';
import { sendEmail, sendSMS } from '@/lib/notify';

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const all = await getAppointments();
  const url = new URL(req.url);
  const open = url.searchParams.get('open') === '1';
  let list: Appointment[];
  if (user.role === 'admin') {
    list = all;
  } else if (open) {
    list = all.filter((a) => a.status === 'open' && !a.patientId);
  } else {
    list = all.filter((a) => a.patientId === user.id);
  }
  return NextResponse.json({ items: list.sort((a, b) => a.date.localeCompare(b.date)) });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  // Admin: create open slot
  if (user.role === 'admin') {
    const { date, type, note } = body as { date?: string; type?: 'visit' | 'consult'; note?: string };
    if (!date || !type) return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
    const all = await getAppointments();
    const appt: Appointment = {
      id: uid('a_'),
      date: toISO(date),
      type,
      status: 'open',
      note,
      createdAt: toISO(Date.now()),
    };
    await saveAppointments([...all, appt]);
    return NextResponse.json({ ok: true, item: appt });
  }

  // Patient: reserve existing open slot
  const { slotId, note } = body as { slotId?: string; note?: string };
  if (!slotId) return NextResponse.json({ error: 'use_slot' }, { status: 400 });
  const all = await getAppointments();
  const idx = all.findIndex((a) => a.id === slotId && a.status === 'open' && !a.patientId);
  if (idx === -1) return NextResponse.json({ error: 'slot_unavailable' }, { status: 409 });
  const when = new Date(all[idx].date).getTime();
  const overlap = all.some(
    (a) => a.patientId === user.id && Math.abs(new Date(a.date).getTime() - when) < 60 * 60 * 1000,
  );
  if (overlap) return NextResponse.json({ error: 'overlap' }, { status: 409 });
  const updated: Appointment = { ...all[idx], patientId: user.id, status: 'pending', note: note ?? all[idx].note } as any;
  all[idx] = updated;
  await saveAppointments(all);
  await sendEmail(
    user.email,
    'ثبت نوبت جدید',
    `کاربر گرامی ${user.name}\n\nنوبت شما ثبت شد و در انتظار تایید است.\nشناسه نوبت: ${updated.id}\nتاریخ: ${new Date(updated.date).toLocaleString('fa-IR-u-ca-persian')}`,
  );
  if (user.phone) {
    try {
      await sendSMS(
        user.phone,
        `کلینیک دکتر عزیزمحمدی\nنوبت شما ثبت شد و در انتظار تایید است.\nکد: ${updated.id}\n${new Date(updated.date).toLocaleString('fa-IR-u-ca-persian')}`,
      );
    } catch {}
  }
  return NextResponse.json({ ok: true, item: updated });
}
