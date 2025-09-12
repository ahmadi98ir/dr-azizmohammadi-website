"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [ticket, setTicket] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [otpLeft, setOtpLeft] = useState(0);
  const router = useRouter();
  // cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // OTP expiry ticker (visible on step 2)
  useEffect(() => {
    if (step !== 2) return;
    if (otpLeft <= 0) return;
    const t = setInterval(() => setOtpLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step, otpLeft]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (step === 1) {
        if (cooldown > 0) return; // prevent spamming
        const res = await fetch('/api/auth/otp/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 429 && typeof data?.retryAfterSec === 'number') {
            setCooldown(data.retryAfterSec);
          }
          throw new Error(data?.error || 'خطا در ارسال کد');
        }
        // start standard cooldown (e.g., 60s) if server didn't set
        const ttlSec = Number(process.env.NEXT_PUBLIC_OTP_TTL_SECONDS || '60');
        setCooldown((prev) => (prev > 0 ? prev : ttlSec));
        setOtpLeft(ttlSec);
        setStep(2);
      } else if (step === 2) {
        const res = await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code: otp, purpose: 'signup' }),
        });
        const data = await res.json();
        if (!res.ok) {
          const err = String(data?.error || 'کد نامعتبر است');
          if (err === 'too_many_attempts') {
            setError('تعداد تلاش‌ها زیاد است. کمی بعد دوباره امتحان کنید.');
            return;
          }
          if (err === 'invalid_code') {
            setError('کد وارد‌شده نادرست است.');
            return;
          }
          throw new Error(err);
        }
        setTicket(data.ticket);
        setStep(3);
      } else if (step === 3) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, otpTicket: ticket }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'خطا در ثبت‌نام');
        router.push('/dashboard');
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
      <h1 className="text-2xl font-bold">ثبت‌نام</h1>
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
                {otpLeft <= 0 ? 'کد منقضی شد' : (loading ? 'در حال بررسی...' : 'تایید کد')}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>ویرایش شماره</button>
              {otpLeft <= 0 && (
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                  ارسال مجدد کد
                </button>
              )}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <label className="text-sm">نام و نام خانوادگی</label>
            <input className="border rounded-lg px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
            <p className="text-xs text-gray-600">ثبت‌نام بدون رمز عبور؛ ورود با کد تایید پیامکی انجام می‌شود.</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="btn btn-primary" type="submit">
              {loading ? 'در حال ثبت‌نام...' : 'تکمیل ثبت‌نام'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
