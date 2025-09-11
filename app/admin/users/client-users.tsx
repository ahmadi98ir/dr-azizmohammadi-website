"use client";
import { useMemo, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'patient' | string;
};

export default function ClientUsers({ items, selfId }: { items: User[]; selfId: string }) {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [list, setList] = useState<User[]>(() => items);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return list.filter((u) => {
      if (role && u.role !== role) return false;
      if (!term) return true;
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone || '').includes(term) ||
        u.id.includes(term)
      );
    });
  }, [list, q, role]);

  async function changeRole(id: string, newRole: string) {
    if (id === selfId && newRole !== 'admin') {
      alert('نمی‌توانید نقش خود را از مدیر حذف کنید.');
      return;
    }
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || 'خطا در تغییر نقش');
      return;
    }
    setList((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <input className="border rounded-lg px-3 py-2 w-64" placeholder="جستجو (نام/ایمیل/موبایل/شناسه)" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="border rounded-lg px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">همه نقش‌ها</option>
          <option value="admin">مدیر</option>
          <option value="patient">بیمار</option>
        </select>
        <div className="text-xs text-gray-600">نتیجه: {filtered.length} نفر</div>
      </div>

      <div className="mt-4 grid gap-3">
        {filtered.map((u) => (
          <div key={u.id} className="card p-4">
            <div className="flex items-center gap-2">
              <div className="font-medium">{u.name}</div>
              <div className="text-sm text-gray-600">{u.email}</div>
              {u.phone && <div className="text-sm text-gray-600">{u.phone}</div>}
              <span className="ms-auto text-xs text-gray-500">#{u.id}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs">نقش:</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={u.role}
                onChange={(e) => changeRole(u.id, e.target.value)}
              >
                <option value="admin">مدیر</option>
                <option value="patient">بیمار</option>
              </select>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-sm text-gray-600">کاربری یافت نشد.</div>}
      </div>
    </div>
  );
}

