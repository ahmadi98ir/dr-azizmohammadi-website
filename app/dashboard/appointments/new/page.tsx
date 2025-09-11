"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import JalaliDateTimePicker from '@/app/components/JalaliDateTimePicker';

export default function NewAppointmentPage() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [type, setType] = useState<'visit' | 'consult'>('visit');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, type, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === 'invalid_fields') throw new Error('لطفاً تاریخ/زمان و نوع را کامل کنید.');
        if (data?.error === 'overlap') throw new Error('در بازه ۶۰ دقیقه‌ای نوبت فعال دارید.');
        if (data?.error === 'unauthorized') throw new Error('برای ثبت نوبت لازم است وارد شوید.');
        throw new Error(data?.error || 'خطا در ثبت نوبت');
      }
      router.push('/dashboard/appointments');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-lg">
      <h1 className="text-2xl font-bold">نوبت جدید</h1>
      <form onSubmit={submit} className="card p-6 mt-6 grid gap-3">
        <JalaliDateTimePicker value={date} onChange={setDate} label="تاریخ و زمان (تقویم جلالی)" />
        <label className="text-sm">نوع</label>
        <select className="border rounded-lg px-3 py-2" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="visit">ویزیت</option>
          <option value="consult">مشاوره</option>
        </select>
        <label className="text-sm">توضیحات</label>
        <textarea className="border rounded-lg px-3 py-2 min-h-24" value={note} onChange={(e) => setNote(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button disabled={loading} className="btn btn-primary" type="submit">
            ثبت نوبت
          </button>
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}
