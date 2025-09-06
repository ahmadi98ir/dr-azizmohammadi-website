import { requireUser } from '@/lib/session';
import Link from 'next/link';

async function fetchAppointments() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(base + '/api/appointments', { cache: 'no-store' });
  if (!res.ok) return [] as any[];
  const data = await res.json();
  return data.items as any[];
}

export default async function AdminHome() {
  const user = await requireUser('admin');
  if (!user)
    return (
      <div className="container py-10">
        <p>دسترسی غیرمجاز</p>
      </div>
    );

  const appts = await fetchAppointments();
  const pending = appts.filter((a) => a.status === 'pending').length;
  const approved = appts.filter((a) => a.status === 'approved').length;

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">داشبورد مدیریت</h1>
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="card p-5">
          <div className="text-sm text-gray-600">نوبت‌های در انتظار</div>
          <div className="text-2xl font-bold mt-2">{pending}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-gray-600">نوبت‌های تایید شده</div>
          <div className="text-2xl font-bold mt-2">{approved}</div>
        </div>
        <Link href="/admin/appointments" className="card p-5 hover:shadow-md transition">
          مدیریت نوبت‌ها
        </Link>
        <Link href="/admin/posts" className="card p-5 hover:shadow-md transition">
          مدیریت مقالات
        </Link>
        <Link href="/admin/faq" className="card p-5 hover:shadow-md transition">
          مدیریت سوالات متداول
        </Link>
        <Link href="/admin/notifications" className="card p-5 hover:shadow-md transition">
          اعلان‌ها
        </Link>
      </div>
    </div>
  );
}
