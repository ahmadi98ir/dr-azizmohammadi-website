"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AdminAppointmentDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('approved');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/appointments/${id}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setItem(data.item);
    setDate(data.item?.date?.slice(0, 16));
    setStatus(data.item?.status || 'approved');
  }

  useEffect(() => {
    load();
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || 'خطا در ذخیره');
    } else {
      router.push('/admin/appointments');
      router.refresh();
    }
  };

  if (!item)
    return (
      <div className="container py-10">
        <p>در حال بارگذاری...</p>
      </div>
    );

  return (
    <div className="container py-10 max-w-lg">
      <h1 className="text-2xl font-bold">ویرایش نوبت</h1>
      <div className="card p-6 mt-6 grid gap-3">
        <div className="text-sm text-gray-600">شناسه: {item.id}</div>
        <div className="text-sm text-gray-600">بیمار: {item.patientId}</div>
        <form onSubmit={save} className="grid gap-3">
          <label className="text-sm">تاریخ و زمان</label>
          <input type="datetime-local" className="border rounded-lg px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
          <label className="text-sm">وضعیت</label>
          <select className="border rounded-lg px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">در انتظار</option>
            <option value="approved">تایید</option>
            <option value="rejected">رد</option>
            <option value="cancelled">لغو</option>
            <option value="completed">انجام شد</option>
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">
              ذخیره تغییرات
            </button>
            <button className="btn btn-outline" type="button" onClick={() => router.back()}>
              بازگشت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

