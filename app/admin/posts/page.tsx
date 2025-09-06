"use client";
import { useEffect, useState } from 'react';

export default function AdminPostsPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/posts');
    if (res.ok) setItems((await res.json()).items || []);
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, content, published })
    });
    const data = await res.json();
    if (!res.ok) setError(data?.error || 'خطا در ایجاد');
    else { setTitle(''); setSlug(''); setContent(''); setPublished(false); load(); }
  };

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">مدیریت مقالات</h1>
      <form onSubmit={create} className="card p-6 mt-6 grid gap-3 max-w-2xl">
        <input className="border rounded-lg px-3 py-2" placeholder="عنوان" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="border rounded-lg px-3 py-2" placeholder="اسلاگ (لاتین)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <textarea className="border rounded-lg px-3 py-2 min-h-40" placeholder="محتوا" value={content} onChange={(e) => setContent(e.target.value)} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> انتشار</label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary w-fit" type="submit">ایجاد مقاله</button>
      </form>
      <div className="mt-8 grid gap-3 max-w-2xl">
        {items.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-gray-600">/{p.slug} — {p.published ? 'منتشر شده' : 'پیش‌نویس'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

