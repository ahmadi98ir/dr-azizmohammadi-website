import { requireUser } from '@/lib/session';
import ClientPayments from './client-payments';

export default async function AdminPaymentsPage() {
  const admin = await requireUser('admin');
  if (!admin) return <div className="py-10">دسترسی غیرمجاز</div>;
  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold">تراکنش‌ها</h1>
      <ClientPayments />
    </div>
  );
}

