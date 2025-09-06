import Link from 'next/link';
import { requireUser } from '@/lib/session';

export default async function DashboardHome() {
  const user = await requireUser('patient');
  if (!user)
    return (
      <div className="container py-10">
        <p>لطفاً وارد حساب کاربری شوید.</p>
      </div>
    );
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">سلام، {user.name}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Link href="/dashboard/appointments/new" className="card p-5 hover:shadow-md transition">
          رزرو نوبت جدید
        </Link>
        <Link href="/dashboard/appointments" className="card p-5 hover:shadow-md transition">
          نوبت‌های من
        </Link>
      </div>
    </div>
  );
}

