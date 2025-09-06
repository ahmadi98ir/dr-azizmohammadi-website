import { requireUser } from '@/lib/session';

export default async function MeetPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return <div className="container py-10">دسترسی غیرمجاز</div>;
  const domain = process.env.JITSI_DOMAIN || 'meet.jit.si';
  const room = `clinic-azizmohammadi-${params.id}`;
  const url = `https://${domain}/${room}`;
  return (
    <div className="container py-6">
      <h1 className="text-xl font-bold">جلسه ویدئویی</h1>
      <div className="mt-4 aspect-video w-full bg-black rounded-xl overflow-hidden">
        <iframe src={url} className="w-full h-full" allow="camera; microphone; fullscreen; display-capture" />
      </div>
      <p className="text-sm text-gray-600 mt-2">اگر ویدئو بارگذاری نشد، لینک مستقیم: <a className="text-primary-700 underline" href={url} target="_blank">{url}</a></p>
    </div>
  );
}

