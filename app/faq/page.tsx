async function fetchFaq() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(base + '/api/faq', { cache: 'no-store' });
  if (!res.ok) return [] as any[];
  const data = await res.json();
  return data.items as any[];
}

export default async function FAQPage() {
  const items = await fetchFaq();
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">سوالات متداول</h1>
      <div className="mt-6 grid gap-4">
        {items.map((f) => (
          <div key={f.id} className="card p-4">
            <div className="font-semibold">{f.question}</div>
            <div className="text-gray-700 mt-2 whitespace-pre-wrap">{f.answer}</div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-600">در حال حاضر سوالی ثبت نشده است.</p>}
      </div>
    </div>
  );
}

