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
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<Item[]>(() => items);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(items.length);

  useMemo(() => {
    // initial pages from SSR list
    setPages(Math.max(1, Math.ceil(items.length / limit)));
    setTotal(items.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRemote() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (status) params.set('status', status);
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await fetch(`/api/admin/appointments?` + params.toString(), { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطای دریافت');
      setList(data.items || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e.message || 'خطا');
    } finally {
      setLoading(false);
    }
  }

  // Fetch on filters/page change
  useMemo(() => {
    fetchRemote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, page]);

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
        <div className="text-xs text-gray-600">نتیجه: {total} مورد</div>
      </div>

      <div className="mt-4 grid gap-3">
        {list.map((a) => (
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
        {loading && <div className="text-sm text-gray-500">در حال بارگذاری...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && list.length === 0 && <div className="text-sm text-gray-600">موردی یافت نشد.</div>}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button className="btn btn-outline text-sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          قبلی
        </button>
        <div className="text-xs text-gray-600">صفحه {page} از {pages}</div>
        <button className="btn btn-outline text-sm" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)}>
          بعدی
        </button>
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
