'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterShopPage() {
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) { setErr('Podaj nazwę sklepu'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/shops/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Se usi l’header fittizio, simula l’utente in dev:
          // 'x-user-email': 'test@example.com'
        },
        body: JSON.stringify({ name, nip: nip || null }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || 'REGISTER_FAILED');
      router.replace('/pos'); // avanti direttamente alla cassa
    } catch (e: any) {
      setErr(e.message || 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12 text-white">
      <h1 className="text-2xl font-semibold">Utwórz sklep</h1>
      <p className="mt-2 text-sm text-neutral-300">
        Uzupełnij nazwę (i opcjonalnie NIP). Możesz to zmienić później.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Nazwa sklepu *</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/40"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Np. Sklep u Kasi"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">NIP (opcjonalnie)</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/40"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="Np. 1234567890"
          />
        </div>

        {err && <p className="text-sm text-red-300">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-6 py-2 font-semibold text-black hover:opacity-95 disabled:opacity-60"
        >
          {loading ? 'Zapisywanie…' : 'Zapisz i przejdź do kasy'}
        </button>
      </form>
    </main>
  );
}
