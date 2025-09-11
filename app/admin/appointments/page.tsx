import { requireUser } from '@/lib/session';
import { getAppointments } from '@/lib/db';
import ClientTable from './client-table';
import NewSlot from './new-slot';

export default async function AdminAppointments() {
  const user = await requireUser('admin');
  if (!user) return <div className="py-10">دسترسی غیرمجاز</div>;
  const items = await getAppointments();
  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold">نوبت‌ها</h1>
      <NewSlot />
      <ClientTable items={items} />
    </div>
  );
}
