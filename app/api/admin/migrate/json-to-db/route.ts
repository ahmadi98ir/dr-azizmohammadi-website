import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { saveUsers, saveAppointments, saveMessages, saveSessions } from '@/lib/db';

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try { const txt = await fs.readFile(file, 'utf8'); return JSON.parse(txt) as T; } catch { return fallback; }
}

export async function POST() {
  const admin = await requireUser('admin');
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const prisma = await getPrisma();
  if (!prisma) return NextResponse.json({ error: 'prisma_disabled' }, { status: 400 });

  const dataDir = path.join(process.cwd(), 'data');
  const users = await readJson<any[]>(path.join(dataDir, 'users.json'), []);
  const appts = await readJson<any[]>(path.join(dataDir, 'appointments.json'), []);
  const msgs = await readJson<any[]>(path.join(dataDir, 'messages.json'), []);
  const sessions = await readJson<any[]>(path.join(dataDir, 'sessions.json'), []);

  // Push into DB via save* which uses prisma when enabled
  await saveUsers(users as any);
  await saveAppointments(appts as any);
  await saveMessages(msgs as any);
  await saveSessions(sessions as any);

  return NextResponse.json({ ok: true, counts: { users: users.length, appointments: appts.length, messages: msgs.length, sessions: sessions.length } });
}

export const dynamic = 'force-dynamic';

