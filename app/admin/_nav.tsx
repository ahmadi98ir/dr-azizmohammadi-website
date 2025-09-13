"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav({ user }: { user: { name: string; role: string } | null }) {
  const pathname = usePathname() || '';
  const Item = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        className={'admin-nav-link text-sm px-3 py-2 rounded-lg border whitespace-nowrap ' + (active ? 'is-active' : '')}
      >
        {children}
      </Link>
    );
  };
  return (
    <div className="flex items-center gap-3 overflow-x-auto">
      <Item href="/admin">داشبورد</Item>
      <Item href="/admin/appointments">نوبت‌ها</Item>
      <Item href="/admin/users">کاربران</Item>
      <Item href="/admin/posts">مقالات</Item>
      <Item href="/admin/faq">سوالات متداول</Item>
      <Item href="/admin/notifications">اعلان‌ها</Item>
      <Item href="/admin/payments">تراکنش‌ها</Item>
      <Item href="/admin/audit">گزارشات</Item>
      <div className="flex-1" />
      {user && (
        <div className="text-xs text-gray-600 whitespace-nowrap">ورود به عنوان: {user.name} ({user.role === 'admin' ? 'مدیر' : 'کاربر'})</div>
      )}
    </div>
  );
}
