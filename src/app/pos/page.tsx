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

      // pull all’avvio
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

      // backfill: se sul server manca qualcosa di locale (già synced), re-invialo
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
      // offline o errore: ignora
    }
  }

  async function handleClick(type: EventType) {
    if (!session) return;
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
            client_event_id: e.id, // unico per shop
          })),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) {
        console.warn('[sync] errore', j);
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
    if (confirm('Vuoi cancellare tutti gli eventi di oggi per questo shop?')) {
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
  }, [session?.shopId]); // rilegarsi al nuovo shop

  const counts = events.reduce(
    (acc, e) => ({ ...acc, [e.type]: (acc[e.type] || 0) + 1 }),
    {} as Record<EventType, number>
  );
  const unsyncedCount = events.filter((e) => !e.synced).length;

  if (loading) return <main className="min-h-[100svh] grid place-items-center">Caricamento…</main>;
  if (!session) return null;

  return (
    <main className="min-h-[100svh] p-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="text-sm text-neutral-400">
          <span className="font-medium text-neutral-200">{session.email}</span> · {session.role} ·{' '}
          <span className="px-2 py-0.5 rounded bg-neutral-800">{session.shopId}</span>
        </div>

        <nav className="flex items-center gap-3">
          <span className="text-xs rounded-full px-2 py-0.5 bg-neutral-800">
            {navigator.onLine ? (syncing ? 'Syncing…' : `Pending: ${unsyncedCount}`) : 'Offline'}
          </span>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm text-white disabled:opacity-50"
          >
            {syncing ? 'Sincronizzo…' : `Sincronizza (${unsyncedCount})`}
          </button>
          <button
            onClick={() => pullFromServer(session.shopId)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-white"
          >
            Aggiorna
          </button>
          <a href="/report" className="text-sm underline text-neutral-300 hover:text-white">Report</a>
          <a href="/api/auth/logout" className="text-sm underline text-rose-300 hover:text-rose-200">Logout</a>
        </nav>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => handleClick('PLASTIC')}
          className="h-32 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 text-black text-2xl font-bold active:scale-[.98] transition"
        >
          PLASTIC ({counts.PLASTIC || 0})
        </button>
        <button
          onClick={() => handleClick('ALU')}
          className="h-32 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-400 text-black text-2xl font-bold active:scale-[.98] transition"
        >
          ALU ({counts.ALU || 0})
        </button>
        <button
          onClick={() => handleClick('SZKLO')}
          className="h-32 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-800 text-white text-2xl font-bold active:scale-[.98] transition"
        >
          SZKLO ({counts.SZKLO || 0})
        </button>
      </section>

      <footer className="mt-10 text-sm text-neutral-500">
        Totale oggi: {events.length} eventi
        <button onClick={handleClear} className="ml-4 underline hover:text-red-400">Cancella tutti (shop)</button>
      </footer>
    </main>
  );
}
