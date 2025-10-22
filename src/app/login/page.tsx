'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const DEV = process.env.NEXT_PUBLIC_DEV_LOGIN === '1';
type Rola = 'admin' | 'cashier';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [advanced, setAdvanced] = useState(false); // tylko w DEV
  const [shop, setShop] = useState('Shop 1');
  const [role, setRole] = useState<Rola>('cashier');
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function sendMagicLink() {
    setSubmitting(true);
    setInfo(null);
    setErr(null);
    try {
      const body: any = { email };
      if (DEV && advanced) {
        body.shopName = shop;
        body.role = role;
      }
      const r = await fetch('/api/auth/magic/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (j?.ok) {
        setInfo(
          j.delivered
            ? `Wysłano link logowania na adres: ${email}. Sprawdź skrzynkę (także SPAM).`
            : 'Link wygenerowany na serwerze (tryb testowy).'
        );
      } else if (j?.error === 'INVITE_REQUIRED') {
        setErr('Ten adres e-mail nie ma aktywnego zaproszenia. Skontaktuj się z opiekunem.');
      } else if (j?.error === 'RATE_LIMITED') {
        setErr('Zbyt wiele próśb. Spróbuj ponownie za chwilę.');
      } else {
        setErr(typeof j?.error === 'string' ? j.error : 'Nieoczekiwany błąd podczas wysyłki.');
      }
    } catch {
      setErr('Nieoczekiwany błąd sieci.');
    } finally {
      setSubmitting(false);
    }
  }

  function devLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!DEV) return;
    setSubmitting(true);
    setErr(null);
    try {
      const params = new URLSearchParams({
        email: email || 'admin1@demo.local',
        to: '/pos',
        shop,
        role,
      });
      window.location.href = `/api/auth/magic/dev-login?${params.toString()}`;
    } catch {
      setErr('Nieoczekiwany błąd.');
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
      {/* Tło przyciemnione */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/60" />

      {/* LOGO w lewym górnym rogu – poza kartą */}
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

      {/* KARTA */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-white/10 bg-neutral-900/70 backdrop-blur-md shadow-2xl">
          <div className="px-8 pt-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Zaloguj się</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Wpisz adres e-mail powiązany z Twoim sklepem. Wyślemy jednorazowy link logowania.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="px-8 mt-6 space-y-4 pb-8">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">E-mail</label>
              <input
                type="email"
                required
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan.kowalski@sklep.pl"
                className="w-full h-11 rounded-lg border border-white/10 bg-black/40 text-white placeholder:text-neutral-500 px-3 outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* DEV tylko gdy NEXT_PUBLIC_DEV_LOGIN=1 */}
            {DEV && (
              <details
                className="rounded-lg border border-white/10 bg-black/30 text-neutral-300"
                open={advanced}
                onToggle={(e) => setAdvanced((e.target as HTMLDetailsElement).open)}
              >
                <summary className="cursor-pointer px-3 py-2 text-sm select-none">
                  Zaawansowane (DEV)
                </summary>
                <div className="p-3 grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Sklep</label>
                    <input
                      value={shop}
                      onChange={(e) => setShop(e.target.value)}
                      className="w-full h-10 rounded-md border border-white/10 bg-black/40 text-white px-3 outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Rola</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Rola)}
                      className="w-full h-10 rounded-md border border-white/10 bg-black/40 text-white px-3 outline-none focus:ring-2 focus:ring-white/20"
                    >
                      <option value="admin">admin</option>
                      <option value="cashier">cashier</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={devLogin}
                  disabled={submitting}
                  className="mt-3 w-full h-11 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition"
                >
                  Szybkie logowanie (DEV)
                </button>
              </details>
            )}

            {info && <p className="text-sm text-emerald-300">{info}</p>}
            {err && <p className="text-sm text-rose-400">{err}</p>}

            <button
              type="button"
              disabled={submitting || !email}
              onClick={sendMagicLink}
              className="w-full h-11 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 active:scale-[.99] transition disabled:opacity-50"
            >
              {submitting ? 'Wysyłam…' : 'Wyślij magic link'}
            </button>

            <p className="text-xs text-neutral-500">
              Logując się, akceptujesz nasze{' '}
              <Link href="/legal/terms" className="underline decoration-dotted">Regulamin</Link> oraz{' '}
              <Link href="/legal/privacy" className="underline decoration-dotted">Politykę prywatności</Link>.
            </p>

            {/* Wskazówka status/tips (opcjonalnie) */}
            <p className="text-xs text-neutral-500">
              Nie otrzymałeś wiadomości?{' '}
              <Link href="/status" className="underline decoration-dotted">
                Sprawdź wskazówki
              </Link>{' '}
              i spróbuj ponownie za 2 minuty.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
