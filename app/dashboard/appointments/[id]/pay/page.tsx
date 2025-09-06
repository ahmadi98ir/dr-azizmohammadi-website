"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PayAppointmentPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, amount: 200000 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطا در ایجاد پرداخت');
      window.location.href = data.redirectUrl;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    start();
  }, [id]);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">در حال انتقال به درگاه...</h1>
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}

