import { requireUser } from '@/lib/session';
import Link from 'next/link';
import { getUsers, getAppointments } from '@/lib/db';
import { getPrisma } from '@/lib/prisma';

export default async function AdminHome() {
  const user = await requireUser('admin');
  if (!user) return <div className="py-10">دسترسی غیرمجاز</div>;

  const [users, appts] = await Promise.all([getUsers(), getAppointments()]);
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const patientCount = totalUsers - adminCount;

  const totalAppts = appts.length;
  const pending = appts.filter((a) => a.status === 'pending').length;
  const approved = appts.filter((a) => a.status === 'approved').length;
  const completed = appts.filter((a) => a.status === 'completed').length;

  let paidCount = 0;
  let paidSum = 0;
  try {
    const prisma = await getPrisma();
    if (prisma) {
      const agg = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'paid' } });
      paidSum = agg._sum.amount || 0;
      paidCount = await prisma.payment.count({ where: { status: 'paid' } });
    }
  } catch {}

  const latest = [...appts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold">داشبورد مدیریت</h1>

      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <StatCard label="کاربران" value={totalUsers} sub={`${patientCount} بیمار / ${adminCount} مدیر`} />
        <StatCard label="نوبت‌ها" value={totalAppts} sub={`${pending} در انتظار / ${approved} تایید`} />
        <StatCard label="انجام‌شده" value={completed} sub="نوبت‌های کامل‌شده" />
        <StatCard label="مبالغ پرداخت‌شده" value={paidSum.toLocaleString('fa-IR')} sub={`${paidCount} تراکنش`} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Link href="/admin/appointments" className="card p-5 hover:shadow-md transition">مدیریت نوبت‌ها</Link>
        <Link href="/admin/users" className="card p-5 hover:shadow-md transition">مدیریت کاربران</Link>
        <Link href="/admin/notifications" className="card p-5 hover:shadow-md transition">اعلان‌ها</Link>
        <Link href="/admin/posts" className="card p-5 hover:shadow-md transition">مدیریت مقالات</Link>
        <Link href="/admin/faq" className="card p-5 hover:shadow-md transition">سوالات متداول</Link>
      </div>

      <div className="mt-10">
        <h2 className="font-semibold">آخرین نوبت‌ها</h2>
        <div className="mt-3 grid gap-3">
          {latest.map((a) => (
            <Link key={a.id} href={`/admin/appointments/${a.id}`} className="card p-4 hover:shadow-sm">
              <div className="font-medium">{new Date(a.date).toLocaleString('fa-IR')}</div>
              <div className="text-sm text-gray-600">{a.type === 'visit' ? 'ویزیت' : 'مشاوره'} — {labelStatus(a.status)}</div>
            </Link>
          ))}
          {latest.length === 0 && <div className="text-sm text-gray-600">موردی یافت نشد.</div>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-1">{sub}</div> : null}
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
