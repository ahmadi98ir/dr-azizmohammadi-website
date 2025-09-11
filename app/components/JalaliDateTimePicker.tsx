"use client";
import { useEffect, useMemo, useState } from 'react';
import { toJalali, toGregorian, jDaysInMonth } from '@/lib/jalali';

function pad2(n: number) { return n < 10 ? '0' + n : String(n); }

export default function JalaliDateTimePicker({ value, onChange, label }: { value?: string; onChange: (v: string) => void; label?: string }) {
  const init = useMemo(() => {
    const d = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000);
    const { jy, jm, jd } = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const hh = d.getHours();
    const mm = Math.round(d.getMinutes() / 15) * 15;
    return { jy, jm, jd, hh, mm: mm === 60 ? 0 : mm };
  }, [value]);
  const [jy, setJy] = useState(init.jy);
  const [jm, setJm] = useState(init.jm);
  const [jd, setJd] = useState(init.jd);
  const [hh, setHh] = useState(init.hh);
  const [mm, setMm] = useState(init.mm);

  const years = useMemo(() => {
    const now = new Date();
    const { jy: cy } = toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return Array.from({ length: 3 }, (_, i) => cy - 1 + i);
  }, []);
  const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  const days = useMemo(() => Array.from({ length: jDaysInMonth(jy, jm) }, (_, i) => i + 1), [jy, jm]);

  useEffect(() => {
    // Compose Gregorian local string "YYYY-MM-DDTHH:mm"
    const g = toGregorian(jy, jm, Math.min(jd, jDaysInMonth(jy, jm)));
    const y = g.gy; const m = g.gm; const d = g.gd;
    const local = `${y}-${pad2(m)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}`;
    onChange(local);
  }, [jy, jm, jd, hh, mm, onChange]);

  return (
    <div className="grid gap-2">
      {label && <label className="text-sm">{label}</label>}
      <div className="flex flex-wrap items-center gap-2">
        <select className="border rounded-lg px-2 py-2" value={jy} onChange={(e) => setJy(parseInt(e.target.value))}>
          {years.map((y) => (<option key={y} value={y}>{y}</option>))}
        </select>
        <select className="border rounded-lg px-2 py-2" value={jm} onChange={(e) => setJm(parseInt(e.target.value))}>
          {months.map((m, i) => (<option key={i+1} value={i+1}>{m}</option>))}
        </select>
        <select className="border rounded-lg px-2 py-2" value={jd} onChange={(e) => setJd(parseInt(e.target.value))}>
          {days.map((d) => (<option key={d} value={d}>{d}</option>))}
        </select>
        <select className="border rounded-lg px-2 py-2" value={hh} onChange={(e) => setHh(parseInt(e.target.value))}>
          {Array.from({ length: 24 }, (_, h) => (<option key={h} value={h}>{pad2(h)}</option>))}
        </select>
        :
        <select className="border rounded-lg px-2 py-2" value={mm} onChange={(e) => setMm(parseInt(e.target.value))}>
          {[0, 15, 30, 45].map((m) => (<option key={m} value={m}>{pad2(m)}</option>))}
        </select>
      </div>
    </div>
  );
}

