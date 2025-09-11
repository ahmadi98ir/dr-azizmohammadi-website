import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { getSessionUser } from '@/lib/session';
import AdminNav from './_nav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value || '';
  const user = await getSessionUser(token);

  return (
    <div className="container py-6">
      <AdminNav user={user ? { name: user.name, role: user.role } : null} />
      <div className="mt-4" />
      {children}
    </div>
  );
}
