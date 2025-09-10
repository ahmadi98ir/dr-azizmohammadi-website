import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

type RateRecord = {
  phone: string;
  windowStart: number; // epoch ms
  count: number;
};

const dataDir = path.join(process.cwd(), 'data');
const rateFile = path.join(dataDir, 'otp_rate.json');

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_PER_WINDOW = 5; // max OTP requests per phone per window

async function readAll(): Promise<RateRecord[]> {
  try {
    const txt = await readFile(rateFile, 'utf8');
    return JSON.parse(txt);
  } catch {
    return [];
  }
}

async function saveAll(items: RateRecord[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(rateFile, JSON.stringify(items, null, 2), 'utf8');
}

export async function checkAndConsumeOtpRequest(phone: string): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const now = Date.now();
  const items = await readAll();
  const normalized = phone.replace(/\D/g, '');
  let rec = items.find((r) => r.phone === normalized);
  if (!rec) {
    rec = { phone: normalized, windowStart: now, count: 0 };
    items.push(rec);
  }
  // reset window if expired
  if (now - rec.windowStart > WINDOW_MS) {
    rec.windowStart = now;
    rec.count = 0;
  }
  if (rec.count >= MAX_PER_WINDOW) {
    const retryAfterSec = Math.max(1, Math.ceil((rec.windowStart + WINDOW_MS - now) / 1000));
    return { ok: false, retryAfterSec };
  }
  rec.count += 1;
  await saveAll(items);
  return { ok: true };
}

