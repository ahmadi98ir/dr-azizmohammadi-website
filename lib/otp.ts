import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { toISO, uid } from './utils';

type OtpRecord = {
  id: string;
  phone: string;
  purpose: 'signup';
  codeHash: string;
  salt: string;
  createdAt: string;
  expiresAt: string;
  attempts: number;
};

type TicketRecord = {
  ticket: string;
  phone: string;
  purpose: 'signup';
  createdAt: string;
  expiresAt: string;
  used?: boolean;
};

const dataDir = path.join(process.cwd(), 'data');
const otpsFile = path.join(dataDir, 'otps.json');
const ticketsFile = path.join(dataDir, 'otp_tickets.json');

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const data = await readFile(file, 'utf8');
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}
async function writeJson<T>(file: string, data: T) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

function hashCode(code: string, salt: string): string {
  return crypto.createHash('sha256').update(code + '|' + salt).digest('hex');
}

export function isValidIranPhone(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

export async function createOtp(phone: string, purpose: 'signup' = 'signup') {
  const all = await readJson<OtpRecord[]>(otpsFile, []);
  const code = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6 digits
  const salt = crypto.randomBytes(8).toString('hex');
  const now = Date.now();
  const ttlMinutes = Number(process.env.OTP_TTL_MINUTES || 1);
  const rec: OtpRecord = {
    id: uid('otp_'),
    phone,
    purpose,
    codeHash: hashCode(code, salt),
    salt,
    createdAt: toISO(now),
    expiresAt: toISO(now + ttlMinutes * 60 * 1000),
    attempts: 0,
  };
  // We can prune old records for this phone
  const filtered = all.filter((o) => o.phone !== phone);
  filtered.push(rec);
  await writeJson(otpsFile, filtered);
  return { id: rec.id, code };
}

export async function verifyOtp(phone: string, code: string, purpose: 'signup' = 'signup') {
  const all = await readJson<OtpRecord[]>(otpsFile, []);
  const rec = all.find((o) => o.phone === phone && o.purpose === purpose);
  if (!rec) return { ok: false, error: 'not_found' } as const;
  const now = Date.now();
  if (new Date(rec.expiresAt).getTime() < now) return { ok: false, error: 'expired' } as const;
  // Too many attempts
  const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
  if (rec.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: 'too_many_attempts' } as const;
  }
  const correct = hashCode(code, rec.salt) === rec.codeHash;
  if (!correct) {
    rec.attempts += 1;
    await writeJson(otpsFile, all);
    return { ok: false, error: 'invalid_code' } as const;
  }
  // create ticket
  const tickets = await readJson<TicketRecord[]>(ticketsFile, []);
  const ticket: TicketRecord = {
    ticket: uid('ticket_'),
    phone,
    purpose,
    createdAt: toISO(now),
    expiresAt: toISO(now + 10 * 60 * 1000), // 10 min to complete
  };
  tickets.push(ticket);
  await writeJson(ticketsFile, tickets);
  return { ok: true as const, ticket: ticket.ticket };
}

export async function consumeTicket(ticketStr: string, purpose: 'signup' = 'signup') {
  const tickets = await readJson<TicketRecord[]>(ticketsFile, []);
  const idx = tickets.findIndex((t) => t.ticket === ticketStr && t.purpose === purpose);
  if (idx === -1) return { ok: false, error: 'invalid_ticket' } as const;
  const t = tickets[idx];
  if (t.used) return { ok: false, error: 'used' } as const;
  if (new Date(t.expiresAt).getTime() < Date.now()) return { ok: false, error: 'expired' } as const;
  t.used = true;
  await writeJson(ticketsFile, tickets);
  return { ok: true as const, phone: t.phone };
}
