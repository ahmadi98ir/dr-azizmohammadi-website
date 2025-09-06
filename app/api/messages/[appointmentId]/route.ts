import { NextResponse } from 'next/server';
import { getMessages, saveMessages, getAppointments } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { Message } from '@/lib/types';
import { uid, toISO } from '@/lib/utils';

export async function GET(_: Request, { params }: { params: { appointmentId: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const appts = await getAppointments();
  const appt = appts.find((a) => a.id === params.appointmentId);
  if (!appt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (user.role !== 'admin' && appt.patientId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const all = await getMessages();
  const list = all.filter((m) => m.appointmentId === appt.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return NextResponse.json({ items: list });
}

export async function POST(req: Request, { params }: { params: { appointmentId: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const appts = await getAppointments();
  const appt = appts.find((a) => a.id === params.appointmentId);
  if (!appt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (user.role !== 'admin' && appt.patientId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const { text } = body as { text?: string };
  if (!text || !text.trim()) return NextResponse.json({ error: 'invalid_text' }, { status: 400 });
  const msg: Message = {
    id: uid('m_'),
    appointmentId: appt.id,
    senderId: user.id,
    text: String(text).slice(0, 2000),
    createdAt: toISO(Date.now()),
  };
  const all = await getMessages();
  await saveMessages([...all, msg]);
  return NextResponse.json({ ok: true, item: msg });
}

