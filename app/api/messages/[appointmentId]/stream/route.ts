import { NextResponse } from 'next/server';
import { getMessages, getAppointments } from '@/lib/db';
import { requireUser } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: { appointmentId: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const appts = await getAppointments();
  const appt = appts.find((a) => a.id === params.appointmentId);
  if (!appt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (user.role !== 'admin' && appt.patientId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array>;
  let lastId = (new URL(req.url)).searchParams.get('lastId') || '';

  const stream = new ReadableStream<Uint8Array>({
    async start(c) {
      controller = c;
      controller.enqueue(encoder.encode(`retry: 2000\n\n`));
      const send = (id: string, data: any) => {
        controller.enqueue(encoder.encode(`id: ${id}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      const tick = async () => {
        const all = await getMessages();
        const list = all.filter((m) => m.appointmentId === appt.id);
        const idx = lastId ? list.findIndex((m) => m.id === lastId) : -1;
        const next = idx === -1 ? list.slice(-5) : list.slice(idx + 1);
        for (const m of next) {
          send(m.id, m);
          lastId = m.id;
        }
      };
      const interval = setInterval(tick, 1500);
      await tick();
      const keepAlive = setInterval(() => controller.enqueue(encoder.encode(': ping\n\n')), 15000);
      (req as any).signal?.addEventListener('abort', () => {
        clearInterval(interval);
        clearInterval(keepAlive);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

