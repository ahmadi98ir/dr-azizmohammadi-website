"use client";
import { useEffect, useState } from 'react';

export default function AdminFaqPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/faq');
    if (res.ok) setItems((await res.json()).items || []);
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/faq', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer })
    });
    const data = await res.json();
    if (!res.ok) setError(data?.error || 'خطا در ایجاد');
    else { setQuestion(''); setAnswer(''); load(); }
  };

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">سوالات متداول</h1>
      <form onSubmit={create} className="card p-6 mt-6 grid gap-3 max-w-2xl">
        <input className="border rounded-lg px-3 py-2" placeholder="سوال" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <textarea className="border rounded-lg px-3 py-2 min-h-32" placeholder="پاسخ" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary w-fit" type="submit">افزودن سوال</button>
      </form>
      <div className="mt-8 grid gap-3 max-w-2xl">
        {items.map((f) => (
          <div key={f.id} className="card p-4">
            <div className="font-semibold">{f.question}</div>
            <div className="text-gray-700 mt-2 whitespace-pre-wrap">{f.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

