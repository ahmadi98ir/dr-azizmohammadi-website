import { getUsers } from '@/lib/db';
import { requireUser } from '@/lib/session';
import ClientUsers from './client-users';

export default async function AdminUsersPage() {
  const admin = await requireUser('admin');
  if (!admin) return <div className="py-10">دسترسی غیرمجاز</div>;
  const users = await getUsers();
  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold">کاربران</h1>
      <ClientUsers items={users} selfId={admin.id} />
    </div>
  );
}
