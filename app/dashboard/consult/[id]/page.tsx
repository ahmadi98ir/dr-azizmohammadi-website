"use client";
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

type Msg = { id: string; text: string; createdAt: string; senderId: string };

export default function ConsultChatPage() {
  const params = useParams<{ id: string }>();
  const apptId = params.id;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/messages/${apptId}/stream`);
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
        } catch {}
      };
    } catch {
      // fallback polling if EventSource fails
      const polling = setInterval(async () => {
        const res = await fetch(`/api/messages/${apptId}`, { cache: 'no-store' });
        if (res.ok) setMessages((await res.json()).items || []);
      }, 2000);
      return () => clearInterval(polling);
    }
    return () => {
      es?.close();
    };
  }, [apptId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' });
  }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    try {
      const res = await fetch(`/api/messages/${apptId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطا در ارسال پیام');
      setText('');
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-2xl font-bold">اتاق گفت‌وگو</h1>
      <div className="card mt-6 p-0 overflow-hidden">
        <div ref={listRef} className="h-[50vh] overflow-auto p-4 space-y-3 bg-gray-50">
          {messages.map((m) => (
            <div key={m.id} className="flex">
              <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm max-w-[75%]">
                <div>{m.text}</div>
                <div className="text-[10px] text-gray-500 mt-1">{new Date(m.createdAt).toLocaleTimeString('fa-IR')}</div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="p-3 border-t flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="پیام خود را بنویسید..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            ارسال
          </button>
        </form>
        {error && <p className="text-sm text-red-600 px-3 pb-3">{error}</p>}
      </div>
      <p className="text-xs text-gray-500 mt-3">برای تماس ویدئویی، لینک جلسه توسط پزشک ارسال می‌شود.</p>
    </div>
  );
}
