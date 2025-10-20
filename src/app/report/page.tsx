'use client';
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
      if (j?.ok) setSummary(j.summary);
      else setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadSummary(day); }, [day]);

  function exportCSV() {
    if (!summary) return;
    const csv =
      'Type,Count\n' +
      Object.entries(summary).map(([t, c]) => `${t},${c}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${day}.csv`;
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
    <main className="min-h-[100svh] p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/pos" className="text-sm underline text-neutral-300 hover:text-white">← POS</a>
          <h1 className="text-2xl font-semibold">Report</h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => shiftDay(-1)} className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm">◀</button>
          <input
            type="date"
            value={day}
            max={today}
            onChange={(e) => setDay(e.target.value)}
            className="h-9 rounded-md bg-black/40 border border-white/10 px-3 text-sm"
          />
          <button onClick={() => shiftDay(+1)} disabled={day >= today}
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-sm">▶</button>

          <button
            onClick={exportCSV}
            className="ml-4 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
          >
            CSV
          </button>
          <a
            href={`/api/events/report?date=${day}`}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm"
          >
            PDF
          </a>
        </div>
      </header>

      {loading ? (
        <div className="min-h-[40vh] grid place-items-center">Caricamento…</div>
      ) : !summary ? (
        <div className="min-h-[40vh] grid place-items-center">Nessun dato</div>
      ) : (
        <>
          <table className="w-full text-left border border-white/10 rounded-lg overflow-hidden">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Conteggio</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary).map(([type, count]) => (
                <tr key={type} className="border-t border-white/5">
                  <td className="px-4 py-2">{type}</td>
                  <td className="px-4 py-2">{count}</td>
                </tr>
              ))}
              <tr className="border-t border-white/10 font-semibold">
                <td className="px-4 py-2">Totale</td>
                <td className="px-4 py-2">{total}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-neutral-500">Giorno: {day}</p>
        </>
      )}
    </main>
  );
}
