import Link from 'next/link';
import { requireUser } from '@/lib/session';

async function fetchAppointments(cookieHeader: string | undefined) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(base + '/api/appointments', {
    headers: { cookie: cookieHeader || '' },
    cache: 'no-store',
  });
  if (!res.ok) return [] as any[];
  const data = await res.json();
  return data.items as any[];
}

export default async function MyAppointmentsPage() {
  const user = await requireUser('patient');
  if (!user)
    return (
      <div className="container py-10">
        <p>دسترسی غیرمجاز</p>
      </div>
    );

  // SSR fetch with cookie propagation. Next forwards cookies automatically in server components,
  // but we ensure for production base URL.
  const items = await fetchAppointments(undefined);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">نوبت‌های من</h1>
        <Link href="/dashboard/appointments/new" className="btn btn-primary">
          نوبت جدید
        </Link>
      </div>
      <div className="mt-6 grid gap-4">
        {items.length === 0 && <p className="text-gray-600">نوبتی ثبت نشده است.</p>}
        {items.map((a) => (
          <div key={a.id} className="card p-4 flex items-center gap-4">
            <div className="flex-1">
            <div className="font-medium">{new Date(a.date).toLocaleString('fa-IR-u-ca-persian')}</div>
              <div className="text-sm text-gray-600">
                نوع: {a.type === 'visit' ? 'ویزیت' : 'مشاوره'} — وضعیت: {labelStatus(a.status)}
              </div>
            </div>
            <Link href={`/dashboard/consult/${a.id}`} className="btn btn-outline">
              ورود به گفت‌وگو
            </Link>
            {a.status === 'approved' && (
              <Link href={`/meet/${a.id}`} className="btn btn-outline">
                تماس ویدئویی
              </Link>
            )}
            {a.status === 'pending' && (
              <Link href={`/dashboard/appointments/${a.id}/pay`} className="btn btn-primary">
                پرداخت
              </Link>
            )}
          </div>
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
