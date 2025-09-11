import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { Payment } from './types';
import { uid, toISO } from './utils';
import { getPrisma } from './prisma';

const dataDir = path.join(process.cwd(), 'data');
const file = path.join(dataDir, 'payments.json');

async function readAll(): Promise<Payment[]> {
  try {
    const data = await readFile(file, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveAll(items: Payment[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(file, JSON.stringify(items, null, 2), 'utf8');
}

export async function createPayment(appointmentId: string, amount: number) {
  const prisma = await getPrisma();
  if (prisma) {
    const p = await prisma.payment.create({
      data: { id: uid('p_'), appointmentId, amount, status: 'initiated', createdAt: new Date() },
    });
    return {
      id: p.id,
      appointmentId: p.appointmentId,
      amount: p.amount,
      status: p.status,
      createdAt: new Date(p.createdAt).toISOString(),
      paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : undefined,
      authority: (p as any).authority ?? undefined,
    } as Payment;
  }
  const items = await readAll();
  const p: Payment = {
    id: uid('p_'),
    appointmentId,
    amount,
    status: 'initiated',
    createdAt: toISO(Date.now()),
  };
  items.push(p);
  await saveAll(items);
  return p;
}

export async function getPayment(id: string) {
  const prisma = await getPrisma();
  if (prisma) {
    const p = await prisma.payment.findUnique({ where: { id } });
    if (!p) return null;
    return {
      id: p.id,
      appointmentId: p.appointmentId,
      amount: p.amount,
      status: p.status,
      createdAt: new Date(p.createdAt).toISOString(),
      paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : undefined,
      authority: (p as any).authority ?? undefined,
    } as Payment;
  }
  const items = await readAll();
  return items.find((x) => x.id === id) || null;
}

export async function updatePayment(id: string, patch: Partial<Payment>) {
  const prisma = await getPrisma();
  if (prisma) {
    const data: any = { ...patch };
    if (data.createdAt) data.createdAt = new Date(data.createdAt);
    if (data.paidAt) data.paidAt = new Date(data.paidAt);
    const p = await prisma.payment.update({ where: { id }, data });
    return {
      id: p.id,
      appointmentId: p.appointmentId,
      amount: p.amount,
      status: p.status,
      createdAt: new Date(p.createdAt).toISOString(),
      paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : undefined,
      authority: (p as any).authority ?? undefined,
    } as Payment;
  }
  const items = await readAll();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  await saveAll(items);
  return items[idx];
}

export async function listPaymentsByAppointment(appointmentId: string) {
  const prisma = await getPrisma();
  if (prisma) {
    const items = await prisma.payment.findMany({ where: { appointmentId }, orderBy: { createdAt: 'desc' } });
    return items.map((p: any) => ({
      id: p.id,
      appointmentId: p.appointmentId,
      amount: p.amount,
      status: p.status,
      createdAt: new Date(p.createdAt).toISOString(),
      paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : undefined,
      authority: p.authority ?? undefined,
    })) as Payment[];
  }
  const items = await readAll();
  return items.filter((x) => x.appointmentId === appointmentId);
}

export async function listPayments(): Promise<Payment[]> {
  const prisma = await getPrisma();
  if (prisma) {
    const items = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
    return items.map((p: any) => ({
      id: p.id,
      appointmentId: p.appointmentId,
      amount: p.amount,
      status: p.status,
      createdAt: new Date(p.createdAt).toISOString(),
      paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : undefined,
      authority: p.authority ?? undefined,
    })) as Payment[];
  }
  return await readAll();
}
