import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { Payment } from './types';
import { uid, toISO } from './utils';

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
  const items = await readAll();
  return items.find((x) => x.id === id) || null;
}

export async function updatePayment(id: string, patch: Partial<Payment>) {
  const items = await readAll();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  await saveAll(items);
  return items[idx];
}

export async function listPaymentsByAppointment(appointmentId: string) {
  const items = await readAll();
  return items.filter((x) => x.appointmentId === appointmentId);
}

