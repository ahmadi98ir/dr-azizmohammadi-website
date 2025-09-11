import { requireUser } from '@/lib/session';

async function fetchLogs(page = 1) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/admin/audit?page=${page}`, { cache: 'no-store' });
  if (!res.ok) return { items: [], total: 0, pages: 1, page: 1 };
  return res.json();
}

export default async function AdminAuditPage() {
  const admin = await requireUser('admin');
  if (!admin) return <div className="py-10">دسترسی غیرمجاز</div>;
  const data = await fetchLogs(1);
  const items: any[] = data.items || [];
  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold">گزارشات سامانه</h1>
      <div className="mt-4 grid gap-3">
        {items.map((l) => (
          <div key={l.id} className="card p-4">
            <div className="flex items-center gap-2">
              <div className="font-medium">{l.action}</div>
              <span className="text-xs text-gray-500">#{l.id}</span>
              <span className="text-xs text-gray-600 ms-auto">{new Date(l.createdAt).toLocaleString('fa-IR')}</span>
            </div>
            <div className="text-sm text-gray-700 mt-1">resource: {l.resource || '-'}</div>
            <div className="text-xs text-gray-600">actor: {l.actorId || '-'}</div>
            {l.meta && <pre className="text-xs bg-gray-50 border rounded p-2 mt-2 overflow-x-auto">{JSON.stringify(l.meta, null, 2)}</pre>}
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-600">ورودی موجود نیست.</div>}
      </div>
    </div>
  );
}

