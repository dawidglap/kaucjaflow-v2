'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addEvent,
  allToday,
  clearAll,
  markSynced,
  upsertFromServer,
  type LocalEvent,
  type EventType,
} from '../../../lib/idb';


type Who = { ok: boolean; email: string; role?: string; shopId?: string | null; shopName?: string | null };

export default function PosPage() {
  const router = useRouter();
  const [who, setWho] = useState<Who | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/auth/whoami', { cache: 'no-store' });
        const j = (await r.json()) as Who;
        if (cancelled) return;
        setWho(j);
        // 1) non loggato?
        if (!j?.ok) {
          router.replace('/login');
          return;
        }
        // 2) manca lo shop? vai a /register
        if (!j.shopId) {
          router.replace('/register');
          return;
        }
      } catch {
        if (!cancelled) router.replace('/login');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  // Evita flicker/undefined mentre verifichi
  if (loading || !who?.ok || !who.shopId) {
    return null; // o uno skeleton minimal
  }

  // A questo punto SEI sicuro di avere shopId & (opz.) shopName
  const shopName = who.shopName ?? '—';

export default function PosPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ email: string; role: string; shopId: string } | null>(null);
  const [shopName, setShopName] = useState<string>('Sklep');
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  // bootstrap session + local events + first pull
  useEffect(() => {
    (async () => {
      const r = await fetch('/api/auth/whoami', { cache: 'no-store', credentials: 'same-origin' });
      const j = await r.json();
      if (!j?.loggedIn) {
        window.location.href = '/login';
        return;
      }
      setSession(j.session);
      setEvents(await allToday(j.session.shopId));

      // fetch shop name (uses your new /api/shops/[id])
      try {
        const s = await fetch(`/api/shops/${j.session.shopId}`, { cache: 'no-store' });
        const sj = await s.json().catch(() => ({}));
        if (sj?.ok && sj.name) setShopName(sj.name as string);
        else setShopName(j.session.shopId); // fallback (pilot)
      } catch {
        setShopName(j.session.shopId); // offline/fallback
      }

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

      // backfill local ids that server doesn't know yet
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
      <main
        className="min-h-[100svh] grid place-items-center text-white relative"
        style={{
          backgroundImage: "url('/images/bg-login.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/60" />
        <div className="relative z-10 animate-pulse text-base text-neutral-300">Ładowanie…</div>
      </main>
    );
  }
  if (!session) return null;

  const roleLabel = session.role === 'admin' ? 'admin' : 'cashier';

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

      {/* LOGO */}
      <div className="absolute top-6 left-6 z-20">
      <Link href="/" className="inline-flex items-center gap-3" aria-label="KaucjaFlow — Strona główna">
  <span className="relative block h-6 w-[132px]">
    {/* Light mode */}
    <Image
      src="/images/logo-light.png"
      alt="KaucjaFlow"
      fill
      sizes="132px"
      className="object-contain block dark:hidden"
      priority
    />
    {/* Dark mode */}
    <Image
      src="/images/logo-dark.png"
      alt="KaucjaFlow"
      fill
      sizes="132px"
      className="object-contain hidden dark:block"
      priority
    />
  </span>
</Link>
      </div>

      {/* HEADER glass */}
      <header className="relative z-10 px-4 md:px-6 pt-24 md:pt-28">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 px-5 md:px-8 py-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-neutral-400">Sklep</div>
              <div className="text-lg md:text-xl font-semibold truncate">{shopName}</div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              {/* <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm text-neutral-200">
                Rola: <span className="font-medium">{roleLabel}</span>
              </span> */}
              <span
                className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm"
                title={online ? 'Połączono' : 'Offline'}
                aria-live="polite"
              >
                {online ? (syncing ? 'Synchronizacja…' : `Oczekuje: ${unsyncedCount}`) : 'Offline'}
              </span>

              {/* Akcje: Raport & Wyloguj */}
              <Link
                href="/report"
                className="rounded-xl px-4 py-2 text-sm font-semibold bg-white text-black hover:bg-neutral-200 active:scale-[.99] transition"
                title="Raport dzienny"
              >
                Raport
              </Link>
              <a
                href="/api/auth/logout?to=/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold border border-white/10 bg-black/40 hover:bg-black/60"
              >
                Wyloguj
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN – 3 przyciski */}
      <section className="relative z-10 px-4 md:px-6 mt-6">
        <div className="mx-auto max-w-5xl min-h-[38vh] md:min-h-[44vh] grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* PLASTIK */}
          <button
            onClick={() => handleClick('PLASTIC')}
            className="
              group h-full rounded-3xl shadow-sm hover:shadow-md transition active:scale-[.985]
              focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50
              bg-gradient-to-b from-amber-400 to-amber-600 text-black
            "
            aria-label="Dodaj 1 Plastik"
          >
            <div className="h-full w-full grid place-items-center p-6">
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide opacity-85">Dodaj</div>
                <div className="mt-1 text-4xl  font-extrabold">PLASTIK</div>
                <div className="mt-2 text-3xl opacity-90 tabular-nums">({counts.PLASTIC || 0})</div>
              </div>
            </div>
          </button>

          {/* SZKŁO */}
          <button
            onClick={() => handleClick('SZKLO')}
            className="
              group h-full rounded-3xl shadow-sm hover:shadow-md transition active:scale-[.985]
              focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/50
              bg-gradient-to-b from-emerald-500 to-emerald-700 text-white
            "
            aria-label="Dodaj 1 Szkło"
          >
            <div className="h-full w-full grid place-items-center p-6">
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide text-white/90">Dodaj</div>
                <div className="mt-1 text-4xl  font-extrabold">SZKŁO</div>
                <div className="mt-2 text-3xl text-white/95 tabular-nums">({counts.SZKLO || 0})</div>
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
            "
            aria-label="Dodaj 1 Aluminium"
          >
            <div className="h-full w-full grid place-items-center p-6">
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide text-white/90">Dodaj</div>
                <div className="mt-1 text-4xl  font-extrabold">ALUMINIUM</div>
                <div className="mt-2 text-3xl text-white/95 tabular-nums">({counts.ALU || 0})</div>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* FOOTER – total + akcje pomocnicze */}
 <footer className="relative z-10 px-4 md:px-6 mt-6 pb-8">
  <div
    className="
      mx-auto max-w-5xl rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md shadow-2xl
      px-5 md:px-8 py-4
      grid grid-cols-1 gap-3
      sm:grid-cols-2 sm:items-center sm:gap-4
      md:flex md:items-center md:justify-between
    "
  >
    <div className="font-semibold text-center sm:text-left">
      Dziś razem: <span className="tabular-nums">{events.length}</span>
    </div>

    <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-3">
      <button
        onClick={() => pullFromServer(session.shopId)}
        className="rounded-xl px-4 py-2 text-xs md:text-sm font-semibold border border-white/10 bg-black/40 hover:bg-black/60"
        title="Pobierz najnowsze dane z serwera"
      >
        Odśwież
      </button>

      <button
        onClick={handleSync}
        disabled={syncing}
        className="rounded-xl px-4 py-2 text-xs md:text-sm font-semibold bg-white text-black hover:bg-neutral-200 active:scale-[.99] transition disabled:opacity-50"
      >
        {syncing ? 'Synchronizacja…' : 'Synchronizuj'}
      </button>

      <button
        onClick={handleClear}
        className="rounded-xl px-4 py-2 text-xs md:text-sm font-semibold text-rose-300 hover:text-rose-200 underline underline-offset-4"
      >
        Wyczyść dzisiaj
      </button>
    </div>
  </div>
</footer>

    </main>
  );
}
