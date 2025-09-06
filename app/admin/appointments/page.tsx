import Link from 'next/link';
import { requireUser } from '@/lib/session';

async function fetchAppointments() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(base + '/api/appointments', { cache: 'no-store' });
  if (!res.ok) return [] as any[];
  const data = await res.json();
  return data.items as any[];
}

export default async function AdminAppointments() {
  const user = await requireUser('admin');
  if (!user)
    return (
      <div className="container py-10">
        <p>دسترسی غیرمجاز</p>
      </div>
    );
  const items = await fetchAppointments();
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">نوبت‌ها</h1>
      <div className="mt-6 grid gap-4">
        {items.map((a) => (
          <Link key={a.id} href={`/admin/appointments/${a.id}`} className="card p-4 hover:shadow-md">
            <div className="font-medium">{new Date(a.date).toLocaleString('fa-IR')}</div>
            <div className="text-sm text-gray-600">{a.type === 'visit' ? 'ویزیت' : 'مشاوره'} — {labelStatus(a.status)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function labelStatus(s: string) {
  switch (s) {
    case 'pending':
      return 'در انتظار تایید';
    case 'approved':
      return 'تایید شده';
    case 'rejected':
      return 'رد شده';
    case 'cancelled':
      return 'لغو شده';
    case 'completed':
      return 'انجام شده';
    default:
      return s;
  }
}

