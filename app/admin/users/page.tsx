import { getUsers } from '@/lib/db';
import { requireUser } from '@/lib/session';

export default async function AdminUsersPage() {
  const admin = await requireUser('admin');
  if (!admin)
    return (
      <div className="container py-10">
        <p>دسترسی غیرمجاز</p>
      </div>
    );
  const users = await getUsers();
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">کاربران</h1>
      <div className="mt-6 grid gap-3">
        {users.map((u) => (
          <div key={u.id} className="card p-4">
            <div className="font-medium">{u.name}</div>
            <div className="text-sm text-gray-600">{u.email} — {u.role === 'admin' ? 'مدیر' : 'بیمار'}</div>
            {u.phone && <div className="text-sm text-gray-600">موبایل: {u.phone}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
