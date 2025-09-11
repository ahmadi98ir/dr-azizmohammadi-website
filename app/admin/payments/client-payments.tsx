"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Item = {
  id: string;
  appointmentId: string;
  amount: number;
  status: string;
  createdAt?: string;
  paidAt?: string;
  patientName?: string;
  patientEmail?: string;
  appointmentDate?: string;
};

export default function ClientPayments() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [items, setItems] = useState<Item[]>([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (status) params.set('status', status);
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await fetch('/api/admin/payments?' + params.toString(), { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطای دریافت');
      setItems(data.items || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e.message || 'خطا');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, page]);

  async function markPaid(id: string) {
    if (!confirm('تغییر وضعیت به پرداخت‌شده؟')) return;
    const res = await fetch('/api/admin/payments/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    });
    if (res.ok) load();
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <input className="border rounded-lg px-3 py-2 w-64" placeholder="جستجو (شناسه، بیمار، ایمیل)" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="border rounded-lg px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">همه وضعیت‌ها</option>
          <option value="initiated">درحال پرداخت</option>
          <option value="paid">موفق</option>
          <option value="failed">ناموفق</option>
          <option value="cancelled">لغو</option>
        </select>
        <div className="text-xs text-gray-600">نتیجه: {total} مورد</div>
        <a className="btn btn-outline text-sm ms-auto" href="/api/admin/export/payments" target="_blank" rel="noopener noreferrer">خروجی CSV</a>
      </div>

      <div className="mt-4 grid gap-3">
        {items.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-center gap-2">
              <div className="font-medium">{(p.amount || 0).toLocaleString('fa-IR')} تومان</div>
              <span className="text-xs text-gray-600">#{p.id}</span>
              <span className="text-xs text-gray-500">{new Date(p.createdAt || '').toLocaleString('fa-IR')}</span>
              <span className="ms-auto text-xs px-2 py-1 rounded-full border">{labelStatus(p.status)}</span>
            </div>
            <div className="text-sm text-gray-700 mt-1">{p.patientName || ''} {p.patientEmail ? `— ${p.patientEmail}` : ''}</div>
            <div className="text-xs text-gray-600">نوبت: <Link className="underline" href={`/admin/appointments/${p.appointmentId}`}>{p.appointmentId}</Link> — {p.appointmentDate ? new Date(p.appointmentDate).toLocaleString('fa-IR') : ''}</div>
            <div className="flex gap-2 mt-2">
              {p.status !== 'paid' && <button className="btn btn-primary text-sm" onClick={() => markPaid(p.id)}>ثبت پرداخت</button>}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">در حال بارگذاری...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && items.length === 0 && <div className="text-sm text-gray-600">موردی یافت نشد.</div>}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button className="btn btn-outline text-sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>قبلی</button>
        <div className="text-xs text-gray-600">صفحه {page} از {pages}</div>
        <button className="btn btn-outline text-sm" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)}>بعدی</button>
      </div>
    </div>
  );
}

function labelStatus(s: string) {
  switch (s) {
    case 'initiated':
      return 'درحال پرداخت';
    case 'paid':
      return 'موفق';
    case 'failed':
      return 'ناموفق';
    case 'cancelled':
      return 'لغو شده';
    default:
      return s;
  }
}
