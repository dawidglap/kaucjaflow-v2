'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Summary = { PLASTIC: number; ALU: number; SZKLO: number };

export default function ReportPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [day, setDay] = useState(today);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);

  async function loadSummary(d: string) {
    setLoading(true);
    try {
      const r = await fetch(`/api/events/summary?date=${d}`, { credentials: 'same-origin' });
      const j = await r.json();
      if (j?.ok) setSummary(j.summary as Summary);
      else setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadSummary(day); }, [day]);

  function exportCSV() {
    if (!summary) return;
    const csv =
      'Typ,Liczba\n' +
      Object.entries(summary).map(([t, c]) => `${t},${c}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raport-${day}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function shiftDay(delta: number) {
    const d = new Date(day);
    d.setDate(d.getDate() + delta);
    const next = d.toISOString().slice(0, 10);
    setDay(next);
  }

  const total = summary ? summary.PLASTIC + summary.ALU + summary.SZKLO : 0;

  return (
    <main
      className="min-h-screen relative text-white overflow-hidden"
      style={{
        backgroundImage: "url('/images/bg-login.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Przyciemnienie tła */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/60" />

      {/* LOGO w lewym górnym rogu */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="KaucjaFlow — panel partnera"
            width={160}
            height={48}
            className="rounded-md object-contain drop-shadow"
            priority
          />
          <span className="sr-only">Strona główna</span>
        </Link>
      </div>

      {/* HEADER glass: tytuł + data + akcje */}
      <header className="relative z-10 px-4 md:px-6 pt-24 md:pt-28">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md shadow-2xl">
          <div className="px-5 md:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/pos" className="text-sm text-neutral-300 hover:text-white underline underline-offset-4">
                ← POS
              </Link>
              <h1 className="text-2xl font-semibold">Raport</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={() => shiftDay(-1)}
                className="px-2 py-1 rounded border border-white/10 bg-black/40 hover:bg-black/60 text-sm"
                title="Poprzedni dzień"
              >
                ◀
              </button>
              <input
                type="date"
                value={day}
                max={today}
                onChange={(e) => setDay(e.target.value)}
                className="h-9 rounded-md bg-black/40 border border-white/10 px-3 text-sm"
              />
              <button
                onClick={() => shiftDay(+1)}
                disabled={day >= today}
                className="px-2 py-1 rounded border border-white/10 bg-black/40 hover:bg-black/60 disabled:opacity-50 text-sm"
                title="Następny dzień"
              >
                ▶
              </button>

              <button
                onClick={exportCSV}
                className="ml-2 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 active:scale-[.99] transition text-sm font-semibold"
              >
                CSV
              </button>
              <a
                href={`/api/events/report?date=${day}`}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 text-white text-sm font-semibold"
              >
                PDF
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <section className="relative z-10 px-4 md:px-6 mt-6 pb-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md shadow-2xl p-5 md:p-8">
          {loading ? (
            <div className="min-h-[36vh] grid place-items-center text-neutral-300">Ładowanie…</div>
          ) : !summary ? (
            <div className="min-h-[36vh] grid place-items-center text-neutral-300">Brak danych</div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-left">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-4 py-2">Typ</th>
                      <th className="px-4 py-2">Liczba</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary).map(([type, count]) => (
                      <tr key={type} className="border-t border-white/5">
                        <td className="px-4 py-2">{type}</td>
                        <td className="px-4 py-2 tabular-nums">{count}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-white/10 font-semibold">
                      <td className="px-4 py-2">Razem</td>
                      <td className="px-4 py-2 tabular-nums">{total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-sm text-neutral-400">Dzień: {day}</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
