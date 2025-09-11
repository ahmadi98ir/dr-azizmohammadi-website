import { promises as fs } from 'fs';
import path from 'path';
import { getPrisma } from './prisma';

export type AuditMeta = Record<string, any> | undefined;

export async function logAudit(action: string, opts?: { actorId?: string; resource?: string; meta?: AuditMeta }) {
  try {
    const prisma = await getPrisma();
    if (prisma) {
      await prisma.auditLog.create({ data: { action, actorId: opts?.actorId || null, resource: opts?.resource || null, meta: (opts?.meta as any) || undefined } });
      return;
    }
  } catch {}
  // JSON fallback
  try {
    const dir = path.join(process.cwd(), 'data');
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, 'audit.json');
    let arr: any[] = [];
    try { arr = JSON.parse(await fs.readFile(file, 'utf8')); } catch {}
    arr.push({ id: String(Date.now()) + Math.random().toString(36).slice(2), action, actorId: opts?.actorId || null, resource: opts?.resource || null, meta: opts?.meta || null, createdAt: new Date().toISOString() });
    await fs.writeFile(file, JSON.stringify(arr, null, 2), 'utf8');
  } catch {}
}

