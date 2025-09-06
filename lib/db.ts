import { promises as fs } from 'fs';
import { User, Appointment, Message, SessionRecord } from './types';
import { uid, toISO } from './utils';
import path from 'path';
import { hashPassword } from './auth';
import { getPrisma } from './prisma';

const dataDir = path.join(process.cwd(), 'data');

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const p = path.join(dataDir, file);
    const data = await fs.readFile(p, 'utf8');
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await ensureDir();
  const p = path.join(dataDir, file);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
}

// Users
export async function getUsers(): Promise<User[]> {
  const prisma = await getPrisma();
  if (prisma) {
    let items = (await prisma.user.findMany()) as any[];
    if (!items.some((u) => u.role === 'admin')) {
      const { hash, salt } = await hashPassword('admin1234');
      const seeded = await prisma.user.create({
        data: {
          name: 'مدیر سیستم',
          email: 'admin@clinic.local',
          role: 'admin',
          passwordSalt: salt,
          passwordHash: hash,
        },
      });
      items = [...items, seeded];
    }
    return items.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: (u as any).phone ?? undefined,
      role: u.role,
      passwordHash: u.passwordHash,
      passwordSalt: u.passwordSalt,
      createdAt: new Date(u.createdAt).toISOString(),
    }));
  }
  const users = await readJson<User[]>('users.json', []);
  // seed admin if none exists
  if (!users.some((u) => u.role === 'admin')) {
    const { hash, salt } = await hashPassword('admin1234');
    const seeded: User = {
      id: uid('u_'),
      name: 'مدیر سیستم',
      email: 'admin@clinic.local',
      role: 'admin',
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: toISO(Date.now()),
    };
    const updated = [...users, seeded];
    await writeJson('users.json', updated);
    return updated;
  }
  return users;
}

export async function saveUsers(users: User[]): Promise<void> {
  const prisma = await getPrisma();
  if (prisma) {
    const ids = users.map((u) => u.id);
    await prisma.user.deleteMany({ where: { id: { notIn: ids } } });
    for (const u of users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: { name: u.name, email: u.email, phone: u.phone ?? null, role: u.role, passwordHash: u.passwordHash, passwordSalt: u.passwordSalt },
        create: { id: u.id, name: u.name, email: u.email, phone: u.phone ?? null, role: u.role, passwordHash: u.passwordHash, passwordSalt: u.passwordSalt, createdAt: new Date(u.createdAt) },
      });
    }
    return;
  }
  await writeJson('users.json', users);
}

export async function getAppointments(): Promise<Appointment[]> {
  const prisma = await getPrisma();
  if (prisma) {
    const items = (await prisma.appointment.findMany()) as any[];
    return items.map((a) => ({
      id: a.id,
      patientId: a.patientId,
      date: new Date(a.date).toISOString(),
      type: a.type,
      status: a.status,
      note: a.note ?? undefined,
      createdAt: new Date(a.createdAt).toISOString(),
    }));
  }
  return await readJson<Appointment[]>('appointments.json', []);
}

export async function saveAppointments(items: Appointment[]): Promise<void> {
  const prisma = await getPrisma();
  if (prisma) {
    const ids = items.map((i) => i.id);
    await prisma.message.deleteMany({ where: { appointmentId: { notIn: ids } } });
    await prisma.payment.deleteMany({ where: { appointmentId: { notIn: ids } } });
    await prisma.appointment.deleteMany({ where: { id: { notIn: ids } } });
    for (const a of items) {
      await prisma.appointment.upsert({
        where: { id: a.id },
        update: { patientId: a.patientId, date: new Date(a.date), type: a.type, status: a.status, note: a.note ?? null },
        create: { id: a.id, patientId: a.patientId, date: new Date(a.date), type: a.type, status: a.status, note: a.note ?? null, createdAt: new Date(a.createdAt) },
      });
    }
    return;
  }
  await writeJson('appointments.json', items);
}

export async function getMessages(): Promise<Message[]> {
  const prisma = await getPrisma();
  if (prisma) {
    const items = (await prisma.message.findMany()) as any[];
    return items.map((m) => ({
      id: m.id,
      appointmentId: m.appointmentId,
      senderId: m.senderId,
      text: m.text,
      createdAt: new Date(m.createdAt).toISOString(),
    }));
  }
  return await readJson<Message[]>('messages.json', []);
}

export async function saveMessages(items: Message[]): Promise<void> {
  const prisma = await getPrisma();
  if (prisma) {
    const ids = items.map((i) => i.id);
    await prisma.message.deleteMany({ where: { id: { notIn: ids } } });
    for (const m of items) {
      await prisma.message.upsert({
        where: { id: m.id },
        update: { appointmentId: m.appointmentId, senderId: m.senderId, text: m.text },
        create: { id: m.id, appointmentId: m.appointmentId, senderId: m.senderId, text: m.text, createdAt: new Date(m.createdAt) },
      });
    }
    return;
  }
  await writeJson('messages.json', items);
}

// Sessions
export async function getSessions(): Promise<SessionRecord[]> {
  const prisma = await getPrisma();
  if (prisma) {
    const items = (await prisma.session.findMany()) as any[];
    return items.map((s) => ({ token: s.token, userId: s.userId, createdAt: new Date(s.createdAt).toISOString(), expiresAt: new Date(s.expiresAt).toISOString() }));
  }
  return await readJson<SessionRecord[]>('sessions.json', []);
}

export async function saveSessions(items: SessionRecord[]): Promise<void> {
  const prisma = await getPrisma();
  if (prisma) {
    const tokens = items.map((i) => i.token);
    await prisma.session.deleteMany({ where: { token: { notIn: tokens } } });
    for (const s of items) {
      await prisma.session.upsert({
        where: { token: s.token },
        update: { userId: s.userId, expiresAt: new Date(s.expiresAt) },
        create: { token: s.token, userId: s.userId, createdAt: new Date(s.createdAt), expiresAt: new Date(s.expiresAt) },
      });
    }
    return;
  }
  await writeJson('sessions.json', items);
}
