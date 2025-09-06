import { NotificationRecord } from './types';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { toISO, uid } from './utils';
import { sendSMSViaProvider } from './sms';

const dataDir = path.join(process.cwd(), 'data');
const file = path.join(dataDir, 'notifications.json');

async function readAll(): Promise<NotificationRecord[]> {
  try {
    const data = await readFile(file, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveAll(items: NotificationRecord[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(file, JSON.stringify(items, null, 2), 'utf8');
}

export async function sendEmail(to: string, subject: string, body: string) {
  const items = await readAll();
  const rec: NotificationRecord = {
    id: uid('n_'),
    type: 'email',
    to,
    subject,
    body,
    status: 'queued',
    createdAt: toISO(Date.now()),
  };
  items.push(rec);
  await saveAll(items);
  return rec.id;
}

export async function sendSMS(to: string, body: string) {
  const items = await readAll();
  const rec: NotificationRecord = {
    id: uid('n_'),
    type: 'sms',
    to,
    subject: 'SMS',
    body,
    status: 'queued',
    createdAt: toISO(Date.now()),
  };
  items.push(rec);
  await saveAll(items);
  // Try provider
  try {
    const result = await sendSMSViaProvider(to, body);
    if (result.ok) {
      rec.status = 'sent';
      await saveAll(items);
      return rec.id;
    } else {
      rec.status = 'failed';
      await saveAll(items);
      return rec.id;
    }
  } catch {
    rec.status = 'failed';
    await saveAll(items);
    return rec.id;
  }
}

export async function listNotifications() {
  return await readAll();
}
