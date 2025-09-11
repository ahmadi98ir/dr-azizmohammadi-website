"use client";
import { useMemo, useState } from 'react';
import Link from 'next/link';

type Item = {
  id: string;
  patientId: string;
  date: string;
  type: string;
  status: string;
  note?: string;
};

export default function ClientTable({ items }: { items: Item[] }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [list, setList] = useState<Item[]>(() => items);
  const filtered = useMemo(() => {
    const term = q.trim();
    return list.filter((a) => {
      if (status && a.status !== status) return false;
      if (!term) return true;
      return (
        a.id.includes(term) ||
        a.patientId.includes(term) ||
        new Date(a.date).toLocaleString('fa-IR').includes(term) ||
        (a.note || '').includes(term)
      );
    });
  }, [list, q, status]);

  async function updateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || 'خطا در بروزرسانی');
      return;
    }
    setList((prev) => prev.map((x) => (x.id === id ? { ...x, status: newStatus } : x)));
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="border rounded-lg px-3 py-2 w-64"
          placeholder="جستجو (شناسه، بیمار، تاریخ، یادداشت)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="border rounded-lg px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">همه وضعیت‌ها</option>
          <option value="pending">در انتظار</option>
          <option value="approved">تایید</option>
          <option value="rejected">رد</option>
          <option value="cancelled">لغو</option>
          <option value="completed">انجام شد</option>
        </select>
        <div className="text-xs text-gray-600">نتیجه: {filtered.length} مورد</div>
      </div>

      <div className="mt-4 grid gap-3">
        {filtered.map((a) => (
          <div key={a.id} className="card p-4">
            <div className="flex items-center gap-2">
              <div className="font-medium">{new Date(a.date).toLocaleString('fa-IR')}</div>
              <span className="text-xs text-gray-500">#{a.id}</span>
              <span className="text-xs text-gray-500">بیمار: {a.patientId}</span>
              <span className="text-xs text-gray-600">{a.type === 'visit' ? 'ویزیت' : 'مشاوره'}</span>
              <span className="ms-auto text-xs px-2 py-1 rounded-full border">
                {labelStatus(a.status)}
              </span>
            </div>

            {a.note && <div className="text-sm text-gray-700 mt-2">یادداشت: {a.note}</div>}

            <div className="flex flex-wrap gap-2 mt-3">
              <Link href={`/admin/appointments/${a.id}`} className="btn btn-outline text-sm">جزئیات</Link>
              <Link href={`/dashboard/consult/${a.id}`} className="btn btn-outline text-sm">ورود به چت</Link>
              <button className="btn btn-primary text-sm" onClick={() => updateStatus(a.id, 'approved')}>تایید</button>
              <button className="btn btn-outline text-sm" onClick={() => updateStatus(a.id, 'completed')}>اتمام</button>
              <button className="btn btn-outline text-sm" onClick={() => updateStatus(a.id, 'cancelled')}>لغو</button>
              <button className="btn btn-outline text-sm" onClick={() => updateStatus(a.id, 'rejected')}>رد</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-sm text-gray-600">موردی یافت نشد.</div>}
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

