"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [ticket, setTicket] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [otpLeft, setOtpLeft] = useState(0);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);
  useEffect(() => {
    if (step !== 2 || otpLeft <= 0) return;
    const t = setInterval(() => setOtpLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step, otpLeft]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (step === 1) {
        const res = await fetch('/api/auth/otp/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, purpose: 'login' }) });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 429 && typeof data?.retryAfterSec === 'number') setCooldown(data.retryAfterSec);
          throw new Error(data?.error || 'خطا در ارسال کد');
        }
        const ttlSec = Number(process.env.NEXT_PUBLIC_OTP_TTL_SECONDS || '60');
        setCooldown((prev) => (prev > 0 ? prev : ttlSec));
        setOtpLeft(ttlSec);
        setStep(2);
      } else if (step === 2) {
        const res = await fetch('/api/auth/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, code: otp, purpose: 'login' }) });
        const data = await res.json();
        if (!res.ok) {
          const err = String(data?.error || 'کد نامعتبر است');
          if (err === 'too_many_attempts') { setError('تعداد تلاش‌ها زیاد است. کمی بعد دوباره امتحان کنید.'); return; }
          if (err === 'invalid_code') { setError('کد وارد‌شده نادرست است.'); return; }
          throw new Error(err);
        }
        setTicket(data.ticket);
        // exchange ticket for session
        const res2 = await fetch('/api/auth/otp/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ otpTicket: data.ticket, purpose: 'login' }) });
        const data2 = await res2.json();
        if (!res2.ok) {
          if (data2?.error === 'not_registered') { setError('کاربری با این شماره ثبت نشده است. لطفاً ثبت‌نام کنید.'); return; }
          throw new Error(data2?.error || 'خطا در ورود');
        }
        const next = params?.get('next') || '/dashboard';
        router.push(next);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-2xl font-bold">ورود</h1>
      <form onSubmit={submit} className="card p-6 mt-6 grid gap-3">
        {step === 1 && (
          <>
            <label className="text-sm">شماره موبایل</label>
            <input className="border rounded-lg px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxxx" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading || cooldown > 0} className="btn btn-primary" type="submit">
              {loading ? 'در حال ارسال کد...' : cooldown > 0 ? `ارسال مجدد در ${cooldown}s` : 'ارسال کد تایید'}
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <label className="text-sm">کد تایید ارسال‌شده به {phone}</label>
            <div className="text-xs text-gray-600">زمان باقی‌مانده: {Math.floor(otpLeft/60)}:{String(otpLeft%60).padStart(2,'0')}</div>
            <input className="border rounded-lg px-3 py-2" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="******" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button disabled={loading || otpLeft <= 0} className="btn btn-primary" type="submit">
                {otpLeft <= 0 ? 'کد منقضی شد' : (loading ? 'در حال بررسی...' : 'تایید و ورود')}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>ویرایش شماره</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
