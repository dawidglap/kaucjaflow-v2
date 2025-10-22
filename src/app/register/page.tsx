'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterShopPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErr('Podaj poprawną nazwę (min. 2 znaki).');
      return;
    }

    setSubmitting(true);
    try {
      const r = await fetch('/api/shops/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include', // wysyła cookie kf_token
        body: JSON.stringify({ name: trimmed }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || 'Nie udało się zapisać nazwy sklepu.');
      }
      router.replace('/pos'); // prosto do kasy po rejestracji
    } catch (e: any) {
      setErr(e?.message || 'Wystąpił nieoczekiwany błąd.');
    } finally {
      setSubmitting(false);
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
      {/* Overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/60" />

      {/* Logo (jak w /login) */}
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

      {/* Link powrotny (mobilny) */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white"
        >
          <span className="inline-block rotate-180 select-none">➜</span> Strona główna
        </Link>
      </div>

      {/* Karta */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-white/10 bg-neutral-900/70 backdrop-blur-md shadow-2xl">
          <div className="px-8 pt-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Nazwij swój sklep</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Trafiłeś tutaj tylko po pierwszej płatności — uzupełnij nazwę sklepu.
              
            </p>
          </div>

          <form onSubmit={onSubmit} className="px-8 mt-6 space-y-4 pb-8">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">
                Nazwa sklepu <span className="text-neutral-500">*</span>
              </label>
              <input
                autoFocus
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Np. Sklep u Kasi"
                className="w-full h-11 rounded-lg border border-white/10 bg-black/40 text-white placeholder:text-neutral-500 px-3 outline-none focus:ring-2 focus:ring-white/20"
              />
              <p className="mt-1 text-xs text-neutral-500">
                To krótkie ustawienie pojawia się tylko raz — potem przejdziesz bezpośrednio do kasy.
              </p>
            </div>

            {err && <p className="text-sm text-rose-400">{err}</p>}

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full h-11 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 active:scale-[.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Zapisywanie…' : 'Zapisz i przejdź do kasy'}
            </button>

            <p className="text-xs text-neutral-500">
              Kontynuując, akceptujesz{' '}
              <Link href="/legal/terms" className="underline decoration-dotted">Regulamin</Link>
              {' '}oraz{' '}
              <Link href="/legal/privacy" className="underline decoration-dotted">Politykę prywatności</Link>.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
