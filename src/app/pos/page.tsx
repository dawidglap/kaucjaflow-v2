'use client';
import { useEffect, useRef, useState } from 'react';
import {
  addEvent,
  allToday,
  clearAll,
  markSynced,
  upsertFromServer,
  type LocalEvent,
  type EventType,
} from '../../../lib/idb';

function shortId(id: string, head = 6, tail = 4) {
  if (!id) return '';
  if (id.length <= head + tail + 1) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}

export default function PosPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ email: string; role: string; shopId: string } | null>(null);
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/auth/whoami', { cache: 'no-store', credentials: 'same-origin' });
      const j = await r.json();
      if (!j?.loggedIn) return (window.location.href = '/login');

      setSession(j.session);
      setEvents(await allToday(j.session.shopId));

      await pullFromServer(j.session.shopId);
      setLoading(false);
    })();
  }, []);

  async function pullFromServer(shopId: string) {
    try {
      const res = await fetch('/api/events', { credentials: 'same-origin' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok || !Array.isArray(j.events)) return;

      await upsertFromServer(
        shopId,
        j.events.map((e: any) => ({
          client_event_id: e.client_event_id ?? e.clientEventId ?? null,
          type: e.type,
          ts: e.ts,
        }))
      );

      const serverIds = new Set(
        j.events.map((e: any) => String(e.client_event_id ?? e.clientEventId ?? '')).filter(Boolean)
      );
      const localToday = await allToday(shopId);
      const toBackfill = localToday.filter(
        (e) => e.synced && e.client_event_id && !serverIds.has(String(e.client_event_id))
      );
      if (toBackfill.length) {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            events: toBackfill.map((e) => ({
              type: e.type,
              ts: e.ts,
              client_event_id: e.client_event_id,
            })),
          }),
        }).catch(() => {});
      }

      setEvents(await allToday(shopId));
    } catch {
      // offline / błąd → ignoruj
    }
  }

  async function handleClick(type: EventType) {
    if (!session) return;
    try { (navigator as any).vibrate?.(15); } catch {}
    await addEvent(session.shopId, type);
    setEvents(await allToday(session.shopId));
  }

  async function handleSync() {
    if (!session || syncingRef.current) return;
    setSyncing(true);
    syncingRef.current = true;
    try {
      const today = await allToday(session.shopId);
      const unsynced = today.filter((e) => !e.synced);
      if (!unsynced.length) return;

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          events: unsynced.map((e) => ({
            type: e.type,
            ts: e.ts,
            client_event_id: e.id, // unikalne w sklepie
          })),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) {
        console.warn('[sync] błąd', j);
        return;
      }

      const ids = unsynced.map((e) => e.id!).filter(Boolean);
      await markSynced(session.shopId, ids);
      setEvents(await allToday(session.shopId));
    } finally {
      setSyncing(false);
      syncingRef.current = false;
    }
  }

  async function handleClear() {
    if (!session) return;
    if (confirm('Usunąć wszystkie dzisiejsze zdarzenia dla tego sklepu?')) {
      await clearAll(session.shopId);
      setEvents([]);
    }
  }

  // AUTO-SYNC
  useEffect(() => {
    if (!session) return;
    const maybeSync = async () => {
      const nowEvents = await allToday(session.shopId);
      const pending = nowEvents.filter((e) => !e.synced).length;
      if (syncingRef.current || !navigator.onLine || pending === 0) return;
      await handleSync();
    };
    const id = setInterval(maybeSync, 20_000);
    const onOnline = () => { void maybeSync(); };
    window.addEventListener('online', onOnline);
    const onVis = () => { if (document.visibilityState === 'visible') void maybeSync(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [session?.shopId]);

  const counts = events.reduce(
    (acc, e) => ({ ...acc, [e.type]: (acc[e.type] || 0) + 1 }),
    {} as Record<EventType, number>
  );
  const unsyncedCount = events.filter((e) => !e.synced).length;
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (loading) {
    return (
      <main className="min-h-[100svh] bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 grid place-items-center">
        <div className="animate-pulse text-base text-slate-400 dark:text-slate-400">Ładowanie…</div>
      </main>
    );
  }
  if (!session) return null;

  return (
    <main className="min-h-[100svh] bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden">
      {/* Full-screen layout */}
      <div className="min-h-[100svh] flex flex-col">
        {/* TOP BAR — bez overflow, ID skrócone z tooltipem */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span
              className="font-semibold text-slate-900 dark:text-slate-100 max-w-[26ch] truncate"
              title={session.shopId}
            >
              {shortId(session.shopId, 8, 6)}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-300 max-w-[32ch] truncate" title={session.email}>
              {session.email}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-xs rounded-full px-2.5 py-1 border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              aria-live="polite"
              title={online ? 'Połączono' : 'Offline'}
            >
              {online ? (syncing ? 'Synchronizacja…' : `Oczekuje: ${unsyncedCount}`) : 'Offline'}
            </span>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="rounded-xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {syncing ? 'Synchronizacja…' : 'Synchronizuj'}
            </button>
          </div>
        </header>

        {/* MAIN — kolory wyraźne, kontrast wysokiej czytelności */}
         <section
        className="
          flex-1 min-h-0                           /* permette alle card di estendersi */
          grid grid-cols-1 md:grid-cols-3 gap-4
          p-5 items-stretch content-stretch
        "
      >
        {/* PLASTIK */}
        <button
          onClick={() => handleClick('PLASTIC')}
          className="
            group h-full rounded-3xl shadow-sm hover:shadow-md transition active:scale-[.985]
            focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50
            bg-gradient-to-b from-amber-400 to-amber-400 text-black
            dark:from-amber-400 dark:to-amber-600
          "
          aria-label="Dodaj 1 Plastik"
        >
          <div className="h-full w-full grid place-items-center p-6">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide opacity-85">Dodaj</div>
              <div className="mt-1 text-4xl md:text-7xl font-extrabold">PLASTIK</div>
              <div className="mt-2 text-2xl opacity-90 tabular-nums">({counts.PLASTIC || 0})</div>
            </div>
          </div>
        </button>

        {/* SZKŁO */}
        <button
          onClick={() => handleClick('SZKLO')}
          className="
            group h-full rounded-3xl shadow-sm hover:shadow-md transition active:scale-[.985]
            focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/50
            bg-gradient-to-b from-emerald-400 to-emerald-600 text-white
            dark:from-emerald-600 dark:to-emerald-700
          "
          aria-label="Dodaj 1 Szkło"
        >
          <div className="h-full w-full grid place-items-center p-6">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-white/90">Dodaj</div>
              <div className="mt-1 text-4xl md:text-7xl font-extrabold">SZKŁO</div>
              <div className="mt-2 text-2xl text-white/95 tabular-nums">({counts.SZKLO || 0})</div>
            </div>
          </div>
        </button>

        {/* ALUMINIUM */}
        <button
          onClick={() => handleClick('ALU')}
          className="
            group h-full rounded-3xl shadow-sm hover:shadow-md transition active:scale-[.985]
            focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-300/60
            bg-gradient-to-b from-zinc-600 to-zinc-700 text-white
            dark:from-zinc-600 dark:to-zinc-700
          "
          aria-label="Dodaj 1 Aluminium"
        >
          <div className="h-full w-full grid place-items-center p-6">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-white/90">Dodaj</div>
              <div className="mt-1 text-4xl md:text-7xl font-extrabold">ALUMINIUM</div>
              <div className="mt-2 text-2xl text-white/95 tabular-nums">({counts.ALU || 0})</div>
            </div>
          </div>
        </button>
      </section>

        {/* BOTTOM BAR */}
        <footer className="px-5 py-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-lg">
          <div className="font-semibold">
            Dziś razem: <span className="tabular-nums">{events.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => pullFromServer(session.shopId)}
              className="rounded-xl px-4 py-2 text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200"
              title="Pobierz najnowsze dane z serwera"
            >
              Odśwież
            </button>
            <button
              onClick={handleClear}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-rose-700 hover:text-rose-800 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:text-rose-300 dark:hover:text-rose-200"
            >
              Wyczyść dzisiaj
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
