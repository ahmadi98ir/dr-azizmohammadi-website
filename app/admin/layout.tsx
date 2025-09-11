import type { ReactNode } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSessionUser } from '@/lib/session';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value || '';
  const user = await getSessionUser(token);

  return (
    <div className="container py-6">
      <div className="flex items-center gap-3 overflow-x-auto">
        <NavLink href="/admin">داشبورد</NavLink>
        <NavLink href="/admin/appointments">نوبت‌ها</NavLink>
        <NavLink href="/admin/users">کاربران</NavLink>
        <NavLink href="/admin/posts">مقالات</NavLink>
        <NavLink href="/admin/faq">سوالات متداول</NavLink>
        <NavLink href="/admin/notifications">اعلان‌ها</NavLink>
        <div className="flex-1" />
        {user && (
          <div className="text-xs text-gray-600 whitespace-nowrap">ورود به عنوان: {user.name} ({user.role === 'admin' ? 'مدیر' : 'کاربر'})</div>
        )}
      </div>
      <div className="mt-4" />
      {children}
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50 whitespace-nowrap">
      {children}
    </Link>
  );
}

