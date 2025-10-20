'use client';
import { useEffect, useState } from 'react';

type Ev = { _id: string; type: 'PLASTIC'|'ALU'|'SZKLO'; ts: number; client_event_id?: string|null };
type Summary = { PLASTIC: number; ALU: number; SZKLO: number };
type RowByDay = { day: string; PLASTIC: number; ALU: number; SZKLO: number; total: number };

/** yyyy-mm-dd del "oggi" locale, senza passare da toISOString() */
function todayLocalYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** somma giorni in modo UTC-safe e ritorna yyyy-mm-dd */
function addDaysYMD(ymd: string, delta: number) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d)); // UTC puro
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10); // già UTC → niente drift
}

/** Lunedì della settimana dell'ancora (impostiamo lunedì come inizio settimana) */
function startOfWeekYMD(anchorYMD: string) {
  const [y, m, d] = anchorYMD.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const wd = dt.getUTCDay(); // 0=dom ... 6=sab
  const delta = wd === 0 ? -6 : 1 - wd; // porta a lunedì
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}
/** Domenica (o meglio: lunedì+6) della settimana dell'ancora */
function endOfWeekYMD(anchorYMD: string) {
  const start = startOfWeekYMD(anchorYMD);
  return addDaysYMD(start, 6);
}

export default function HistoryPage() {
  const [date, setDate] = useState<string>(todayLocalYMD());
  const [loading, setLoading] = useState(true);

  // vista giornaliera
  const [events, setEvents] = useState<Ev[]>([]);
  const [summary, setSummary] = useState<Summary>({ PLASTIC:0, ALU:0, SZKLO:0 });

  // vista per range (settimana)
  const [range, setRange] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });
  const [rowsByDay, setRowsByDay] = useState<RowByDay[]>([]);
  const [rangeTotals, setRangeTotals] = useState({ PLASTIC: 0, ALU: 0, SZKLO: 0, total: 0 });

  // ---- FETCH GIORNALIERO
  async function load(d: string) {
    setLoading(true);
    try {
      const r = await fetch(`/api/events?date=${d}`, { credentials: 'same-origin', cache: 'no-store' });
      const j = await r.json().catch(() => null);
      if (j?.ok) { setEvents(j.events); setSummary(j.summary); }
    } finally {
      setLoading(false);
    }
  }

  // ---- FETCH RANGE (by day)
  async function loadRange(from: string, to: string) {
    setLoading(true);
    try {
      const r = await fetch(`/api/events/by-day?from=${from}&to=${to}`, { credentials: 'same-origin', cache: 'no-store' });
      const j = await r.json().catch(() => null);
      if (j?.ok) {
        setRowsByDay(j.rows || []);
        setRangeTotals(j.totals || { PLASTIC: 0, ALU: 0, SZKLO: 0, total: 0 });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(date); }, []); // prima volta

  function dayShift(delta: number) {
    const next = addDaysYMD(date, delta);
    setDate(next);
    // se stiamo guardando un range, esci dal range tornando al giorno
    if (range.from && range.to) clearRange();
    load(next);
  }

  // --- Bottoni range
  function thisWeek() {
    const from = startOfWeekYMD(date);
    const to = endOfWeekYMD(date);
    setRange({ from, to });
    loadRange(from, to);
  }
  function prevWeek() {
    const from = startOfWeekYMD(date);
    const to = endOfWeekYMD(date);
    const fromPrev = addDaysYMD(from, -7);
    const toPrev = addDaysYMD(to, -7);
    setRange({ from: fromPrev, to: toPrev });
    loadRange(fromPrev, toPrev);
  }
  function clearRange() {
    setRange({ from: null, to: null });
    setRowsByDay([]);
    setRangeTotals({ PLASTIC: 0, ALU: 0, SZKLO: 0, total: 0 });
  }

  // --- Export CSV del range
  function exportRangeCSV() {
    if (!range.from || !range.to || rowsByDay.length === 0) return;
    const header = 'Day,PLASTIC,ALU,SZKLO,Total';
    const lines = rowsByDay.map(r => `${r.day},${r.PLASTIC},${r.ALU},${r.SZKLO},${r.total}`);
    const csv = [header, ...lines, '', `Totals,${rangeTotals.PLASTIC},${rangeTotals.ALU},${rangeTotals.SZKLO},${rangeTotals.total}`].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${range.from}_to_${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-[100svh] p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <h1 className="text-2xl font-semibold">History</h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => dayShift(-1)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm"
          >
            ← Giorno prec.
          </button>

          <input
            type="date"
            value={date}
            onChange={(e) => { const v = e.target.value; setDate(v); clearRange(); load(v); }}
            className="h-10 rounded-md border border-white/10 bg-black/40 text-white px-3 outline-none"
          />

          <button
            onClick={() => dayShift(+1)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm"
          >
            Giorno succ. →
          </button>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <button
            onClick={thisWeek}
            className="px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-sm"
          >
            Questa settimana
          </button>
          <button
            onClick={prevWeek}
            className="px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-sm"
          >
            Settimana scorsa
          </button>

          {range.from && range.to ? (
            <>
              <button
                onClick={exportRangeCSV}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
              >
                Esporta CSV
              </button>
              <button
                onClick={clearRange}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm"
              >
                Esci dal range
              </button>
            </>
          ) : null}
        </div>
      </header>

      {loading ? (
        <div className="grid place-items-center py-20">Caricamento…</div>
      ) : (
        <>
          {/* riepilogo */}
          {!range.from && !range.to ? (
            <>
              <section className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-4 bg-yellow-500/20 border border-yellow-500/30">
                  <div className="text-sm text-neutral-400">PLASTIC</div>
                  <div className="text-2xl font-bold">{summary.PLASTIC}</div>
                </div>
                <div className="rounded-xl p-4 bg-slate-400/20 border border-slate-400/30">
                  <div className="text-sm text-neutral-400">ALU</div>
                  <div className="text-2xl font-bold">{summary.ALU}</div>
                </div>
                <div className="rounded-xl p-4 bg-emerald-600/20 border border-emerald-600/30">
                  <div className="text-sm text-neutral-400">SZKLO</div>
                  <div className="text-2xl font-bold">{summary.SZKLO}</div>
                </div>
              </section>

              {/* lista eventi (giornaliera) */}
              <section className="mt-6">
                <table className="w-full text-left border border-white/10 rounded-lg overflow-hidden">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-4 py-2">Ora</th>
                      <th className="px-4 py-2">Tipo</th>
                      <th className="px-4 py-2">Client ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr key={e._id} className="border-t border-white/5">
                        <td className="px-4 py-2">
                          {new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-2">{e.type}</td>
                        <td className="px-4 py-2 text-xs text-neutral-400">{e.client_event_id || '—'}</td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr><td className="px-4 py-6 text-neutral-500" colSpan={3}>Nessun evento per questo giorno.</td></tr>
                    )}
                  </tbody>
                </table>
              </section>
            </>
          ) : (
            // vista per range (settimanale) -----------------------
            <section className="mt-2 space-y-3">
              <div className="text-sm text-neutral-400">
                Range: <span className="font-medium text-neutral-200">{range.from}</span> →{' '}
                <span className="font-medium text-neutral-200">{range.to}</span>
                {' · '} Totale: <span className="font-medium text-neutral-200">{rangeTotals.total}</span>
                {' · '} P:{rangeTotals.PLASTIC} A:{rangeTotals.ALU} S:{rangeTotals.SZKLO}
              </div>

              <table className="w-full text-left border border-white/10 rounded-lg overflow-hidden">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 py-2">Giorno</th>
                    <th className="px-4 py-2">PLASTIC</th>
                    <th className="px-4 py-2">ALU</th>
                    <th className="px-4 py-2">SZKLO</th>
                    <th className="px-4 py-2">Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {rowsByDay.map((r) => (
                    <tr key={r.day} className="border-t border-white/5">
                      <td className="px-4 py-2">{r.day}</td>
                      <td className="px-4 py-2">{r.PLASTIC}</td>
                      <td className="px-4 py-2">{r.ALU}</td>
                      <td className="px-4 py-2">{r.SZKLO}</td>
                      <td className="px-4 py-2 font-medium">{r.total}</td>
                    </tr>
                  ))}
                  {rowsByDay.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-6 text-neutral-500">Nessun evento nel range.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </main>
  );
}
