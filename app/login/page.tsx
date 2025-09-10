"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  // cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 && typeof data?.retryAfterSec === 'number') {
          setCooldown(data.retryAfterSec);
          throw new Error('تلاش‌های ورود زیاد است. کمی بعد دوباره امتحان کنید.');
        }
        throw new Error(data?.error || 'خطا در ورود');
      }
      router.push('/dashboard');
      router.refresh();
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
        <label className="text-sm">ایمیل</label>
        <input className="border rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="text-sm">رمز عبور</label>
        <input
          type="password"
          className="border rounded-lg px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading || cooldown > 0} className="btn btn-primary" type="submit">
          {loading ? 'در حال ورود...' : cooldown > 0 ? `تلاش مجدد در ${cooldown}s` : 'ورود'}
        </button>
      </form>
    </div>
  );
}
