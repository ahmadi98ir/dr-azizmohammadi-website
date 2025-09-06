async function fetchPosts() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(base + '/api/posts', { cache: 'no-store' });
  if (!res.ok) return [] as any[];
  const data = await res.json();
  return data.items as any[];
}

export default async function BlogPage() {
  const posts = await fetchPosts();
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">مقالات</h1>
      <div className="mt-6 grid gap-4">
        {posts.map((p) => (
          <a key={p.slug} href={`/blog/${p.slug}`} className="card p-4 hover:shadow-md">
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-gray-600">{new Date(p.createdAt).toLocaleDateString('fa-IR')}</div>
          </a>
        ))}
        {posts.length === 0 && <p className="text-gray-600">مطلبی منتشر نشده است.</p>}
      </div>
    </div>
  );
}

