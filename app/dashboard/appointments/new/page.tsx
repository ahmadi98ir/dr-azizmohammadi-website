"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Slot = { id: string; date: string; type: string; note?: string };

export default function NewAppointmentPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/appointments?open=1', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطا در دریافت نوبت‌های خالی');
      setSlots((data.items || []) as Slot[]);
    } catch (e: any) {
      setError(e.message || 'خطا');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function reserve(id: string) {
    setError(null);
    const res = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slotId: id, note }) });
    const data = await res.json();
    if (!res.ok) {
      if (data?.error === 'slot_unavailable') setError('این نوبت دیگر در دسترس نیست.');
      else if (data?.error === 'overlap') setError('در بازه ۶۰ دقیقه‌ای نوبت فعال دارید.');
      else if (data?.error === 'unauthorized') setError('برای رزرو نوبت لازم است وارد شوید.');
      else setError(data?.error || 'خطا در رزرو نوبت');
      return;
    }
    router.push('/dashboard/appointments');
    router.refresh();
  }

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-2xl font-bold">رزرو نوبت</h1>
      <div className="card p-4 mt-4">
        <label className="text-sm">توضیحات برای پزشک (اختیاری)</label>
        <textarea className="border rounded-lg px-3 py-2 w-full min-h-20" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="mt-6 grid gap-3">
        {loading && <div className="text-sm text-gray-500">در حال بارگذاری...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && slots.length === 0 && <div className="text-sm text-gray-600">نوبت خالی در حال حاضر موجود نیست.</div>}
        {slots.map((s) => (
          <div key={s.id} className="card p-4 flex items-center gap-3">
            <div className="font-medium">{new Date(s.date).toLocaleString('fa-IR-u-ca-persian')}</div>
            <div className="text-sm text-gray-600">{s.type === 'visit' ? 'ویزیت' : 'مشاوره'}</div>
            {s.note && <div className="text-sm text-gray-600">— {s.note}</div>}
            <button className="btn btn-primary ms-auto" onClick={() => reserve(s.id)}>رزرو</button>
          </div>
        ))}
      </div>
    </div>
  );
}
