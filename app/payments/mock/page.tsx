"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function MockPaymentPage() {
  const sp = useSearchParams();
  const paymentId = sp.get('paymentId');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!paymentId) return <div className="container py-10">شناسه پرداخت نامعتبر است.</div>;

  const finish = async (ok: boolean) => {
    setLoading(true);
    const qs = new URLSearchParams({ paymentId, status: ok ? 'ok' : 'fail' }).toString();
    window.location.href = `/api/payments/callback?${qs}`;
  };

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-2xl font-bold">درگاه شبیه‌سازی پرداخت</h1>
      <p className="text-gray-600 mt-2">این صفحه فقط برای توسعه و تست است.</p>
      <div className="card p-6 mt-6 grid gap-3">
        <button disabled={loading} onClick={() => finish(true)} className="btn btn-primary">
          پرداخت موفق
        </button>
        <button disabled={loading} onClick={() => finish(false)} className="btn btn-outline">
          پرداخت ناموفق
        </button>
      </div>
    </div>
  );
}

