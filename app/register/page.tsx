"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطا در ثبت‌نام');
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
      <h1 className="text-2xl font-bold">ثبت‌نام</h1>
      <form onSubmit={submit} className="card p-6 mt-6 grid gap-3">
        <label className="text-sm">نام و نام خانوادگی</label>
        <input className="border rounded-lg px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="text-sm">ایمیل</label>
        <input className="border rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="text-sm">شماره موبایل</label>
        <input className="border rounded-lg px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxxx" />
        <label className="text-sm">رمز عبور</label>
        <input
          type="password"
          className="border rounded-lg px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="btn btn-primary" type="submit">
          {loading ? 'در حال ثبت‌نام...' : 'ایجاد حساب'}
        </button>
      </form>
    </div>
  );
}
