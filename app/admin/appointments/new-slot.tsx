"use client";
import { useState } from 'react';
import JalaliDateTimePicker from '@/app/components/JalaliDateTimePicker';

export default function NewSlot() {
  const [date, setDate] = useState('');
  const [type, setType] = useState<'visit' | 'consult'>('visit');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, type, note }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطا در ایجاد نوبت خالی');
      window.location.reload();
    } catch (e: any) {
      setError(e.message || 'خطا');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={create} className="card p-4 mt-4 grid gap-3">
      <h2 className="font-semibold">ایجاد نوبت خالی</h2>
      <JalaliDateTimePicker value={date} onChange={setDate} label="تاریخ و زمان (جلالی)" />
      <label className="text-sm">نوع</label>
      <select className="border rounded-lg px-3 py-2 w-40" value={type} onChange={(e) => setType(e.target.value as any)}>
        <option value="visit">ویزیت</option>
        <option value="consult">مشاوره</option>
      </select>
      <label className="text-sm">یادداشت (اختیاری)</label>
      <textarea className="border rounded-lg px-3 py-2 min-h-20" value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button disabled={loading} className="btn btn-primary w-fit" type="submit">ایجاد نوبت</button>
    </form>
  );
}

