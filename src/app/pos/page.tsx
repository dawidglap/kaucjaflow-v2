'use client';
import { useEffect, useState } from 'react';

export default function PosPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{email:string; role:string; shopId:string} | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/whoami', { cache: 'no-store' });
        const j = await r.json();
        if (j?.loggedIn) setSession(j.session);
        else window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main className="min-h-[100svh] grid place-items-center">Caricamento…</main>;

  if (!session) return null;

  return (
    <main className="min-h-[100svh] p-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          <span className="font-medium text-neutral-200">{session.email}</span> · {session.role} · <span className="px-2 py-0.5 rounded bg-neutral-800">{session.shopId}</span>
        </div>
        <a className="text-sm underline" href="/login">Cambia utente</a>
      </header>

      <section className="grid place-items-center h-[60vh] border border-white/10 rounded-2xl">
        <p className="text-neutral-400">POS shell pronta — prossimi step: bottoni PLASTIC / ALU / SZKLO</p>
      </section>
    </main>
  );
}
