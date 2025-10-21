'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [shop, setShop] = useState('Shop 1');
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMsg(null);
    setErr(null);
    setPreview(null);
    try {
      const r = await fetch('/api/auth/magic/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, shopName: shop, role }),
      });
      const j = await r.json().catch(() => ({}));
      if (j?.ok) {
        setMsg(`Zaproszenie wysłane na: ${email}.`);
        if (j.preview) setPreview(j.preview as string); // podgląd w DEV
      } else if (j?.error === 'RATE_LIMITED') {
        setErr('Za dużo próśb. Spróbuj ponownie za minutę.');
      } else if (typeof j?.error === 'string') {
        setErr(j.error);
      } else {
        setErr('Nieoczekiwany błąd. Spróbuj ponownie.');
      }
    } catch {
      setErr('Błąd sieci. Sprawdź połączenie internetowe.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main
      className="min-h-screen relative flex items-center justify-center overflow-hidden text-white"
      style={{
        backgroundImage: "url('/images/bg-login.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Przyciemnienie tła */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/60" />

      {/* LOGO w lewym górnym rogu – poza kartą */}
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

      {/* Link powrotny (np. do dashboardu admina) */}
      <div className="absolute top-6 right-6 z-20">
        {/* <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white"
        >
          <span className="inline-block rotate-180 select-none">➜</span> Wróć
        </Link> */}
      </div>

      {/* KARTA */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-white/10 bg-neutral-900/70 backdrop-blur-md shadow-2xl">
          <div className="px-8 pt-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Zaproś sklep</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Wyślij jednorazowy link logowania do kasy lub właściciela. Każdy sklep widzi tylko
              swoje dane.
            </p>
          </div>

          <form onSubmit={onSend} className="px-8 mt-6 space-y-4 pb-8">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">Nazwa sklepu</label>
              <input
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                placeholder="np. Shop 1"
                className="w-full h-11 rounded-lg border border-white/10 bg-black/40 text-white placeholder:text-neutral-500 px-3 outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">Adres e-mail odbiorcy</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasa@sklep.pl"
                className="w-full h-11 rounded-lg border border-white/10 bg-black/40 text-white placeholder:text-neutral-500 px-3 outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">Rola</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'cashier')}
                className="w-full h-11 rounded-lg border border-white/10 bg-black/40 text-white px-3 outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="admin">admin (właściciel/manager)</option>
                <option value="cashier">cashier (kasa)</option>
              </select>
            </div>

            <button
              disabled={sending || !email || !shop}
              className="w-full h-11 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 active:scale-[.99] transition disabled:opacity-50"
            >
              {sending ? 'Wysyłam…' : 'Wyślij zaproszenie'}
            </button>

            {/* Komunikaty */}
            {msg && <p className="text-sm text-emerald-300">{msg} Link jest ważny przez ograniczony czas.</p>}
            {err && <p className="text-sm text-rose-400">{err}</p>}

            {/* Podgląd dev (jeśli backend zwraca j.preview) */}
            {preview && (
              <div className="p-3 rounded-lg bg-neutral-900 border border-white/10">
                <div className="text-sm mb-2 text-neutral-300">Podgląd (DEV):</div>
                <a href={preview} className="break-all text-emerald-300 underline">
                  {preview}
                </a>
              </div>
            )}

            {/* Delikatny “sales-proof” box */}
            <div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-neutral-400">
              Wskazówka: utwórz <em>Shop&nbsp;1 … Shop&nbsp;10</em> i wyślij po 1 linku do każdej kasy.
              W razie braku maila w skrzynce – sprawdź SPAM lub wyślij ponownie za 2 minuty.
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
