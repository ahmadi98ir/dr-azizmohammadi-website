import { cookies } from 'next/headers';
import { getSessions, saveSessions, getUsers } from './db';
import { SessionRecord, User } from './types';
import { uid, toISO } from './utils';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(userId: string): Promise<string> {
  const all = await getSessions();
  const token = uid('s_');
  const now = Date.now();
  const rec: SessionRecord = {
    token,
    userId,
    createdAt: toISO(now),
    expiresAt: toISO(now + SESSION_TTL_MS),
  };
  await saveSessions([...all, rec]);
  return token;
}

export async function deleteSession(token: string) {
  const all = await getSessions();
  const filtered = all.filter((s) => s.token !== token);
  await saveSessions(filtered);
}

export async function getSessionUser(token?: string): Promise<User | null> {
  if (!token) return null;
  const [sessions, users] = await Promise.all([getSessions(), getUsers()]);
  const now = Date.now();
  const found = sessions.find((s) => s.token === token && new Date(s.expiresAt).getTime() > now);
  if (!found) return null;
  return users.find((u) => u.id === found.userId) || null;
}

export async function requireUser(role?: 'admin' | 'patient'): Promise<User | null> {
  const store = await cookies();
  const token = store.get('session_token')?.value;
  const user = await getSessionUser(token);
  if (!user) return null;
  if (role && user.role !== role) return null;
  return user;
}

