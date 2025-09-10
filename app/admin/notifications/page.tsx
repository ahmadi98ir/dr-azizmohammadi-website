import { listNotifications } from '@/lib/notify';
import { requireUser } from '@/lib/session';

export default async function AdminNotificationsPage() {
  const user = await requireUser('admin');
  if (!user) return <div className="container py-10">دسترسی غیرمجاز</div>;
  const items = await listNotifications();
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">اعلان‌ها</h1>
      {/* Quick SMS form */}
      <form action={sendSms} className="card p-6 mt-6 grid gap-3 max-w-xl">
        <div className="text-sm text-gray-600">ارسال سریع پیامک (sms.ir)</div>
        <input name="to" className="border rounded-lg px-3 py-2" placeholder="شماره موبایل (09xxxxxxxxx)" />
        <textarea name="message" className="border rounded-lg px-3 py-2 min-h-24" placeholder="متن پیام" />
        <button className="btn btn-primary w-fit" type="submit">ارسال پیامک</button>
      </form>
      <div className="mt-6 grid gap-3">
        {items.map((n) => (
          <div key={n.id} className="card p-4">
            <div className="text-sm text-gray-600">{n.type.toUpperCase()} → {n.to}</div>
            <div className="font-medium">{n.subject}</div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{n.body}</div>
            <div className="text-xs mt-2">
              <span className={
                n.status === 'sent' ? 'text-green-700' : n.status === 'failed' ? 'text-red-700' : 'text-gray-500'
              }>
                وضعیت: {n.status}
              </span>
              {n.error && <span className="text-xs text-red-600 ms-3">خطا: {n.error}</span>}
            </div>
            <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString('fa-IR')}</div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-600">موردی ثبت نشده است.</p>}
      </div>
    </div>
  );
}

async function sendSms(formData: FormData) {
  'use server';
  const to = String(formData.get('to') || '');
  const message = String(formData.get('message') || '');
  if (!to || !message) return;
  await fetch(process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/notify/sms` : 'http://localhost:3000/api/notify/sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, message }),
  });
}
