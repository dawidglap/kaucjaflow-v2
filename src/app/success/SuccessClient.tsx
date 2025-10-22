// src/app/success/SuccessClient.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import Confetti from 'react-confetti';
import Navbar from '@/components/Navbar';
import LegalFooter from '@/components/LegalFooter';

type SuccessData = {
  ok: boolean;
  sessionId?: string;
  email?: string | null;
  subscriptionStatus?: string;
  amountTotal?: number | null;
  currency?: string | null;
  error?: string;
  note?: string;
};

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

export default function SuccessClient({ sessionId }: { sessionId: string }) {
  const prefersReduce = useReducedMotion();
  const { width, height } = useWindowSize();

  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 14, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.3 : 0.5 },
  });

  const [data, setData] = useState<SuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(true);

  // fetch dettagli della sessione
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!sessionId) {
        setData({ ok: false, error: 'missing session_id' });
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/checkout/success?session_id=${encodeURIComponent(sessionId)}`, {
          cache: 'no-store',
        });
        const j = (await res.json()) as SuccessData;
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setData({ ok: false });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    const t = setTimeout(() => setConfetti(false), 5000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [sessionId]);

  const title = useMemo(() => {
    if (!data?.ok) return 'Dziękujemy! 🎉';
    const st = (data?.subscriptionStatus || '').toLowerCase();
    if (st.includes('trial')) return 'Okres próbny uruchomiony! 🎉';
    return 'Subskrypcja aktywna! 🎉';
  }, [data]);

  return (
    <>
      <Navbar />
      <main className="relative isolate min-h-[100dvh] overflow-hidden text-white">
        {/* BACKGROUND */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[80vh] w-[120vw] -translate-x-1/2 rounded-full opacity-60 blur-3xl
                          bg-[radial-gradient(closest-side,theme(colors.zinc.200/.8),transparent_60%)]
                          dark:bg-[radial-gradient(closest-side,theme(colors.zinc.700/.6),transparent_60%)]" />
          <div className="absolute left-1/2 top-1/3 h-[60vh] w-[120vw] -translate-x-1/2 rotate-[-6deg] opacity-50 blur-2xl
                          bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              color: 'rgb(0 0 0 / 0.7)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
            style={{
              backgroundImage:
                'url("data:image/svg+xml;utf8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Cfilter id=%27n%27 x=%270%27 y=%270%27%3E%3CfeTurbulence baseFrequency=%270.8%27 numOctaves=%272%27 stitchTiles=%27stitch%27 type=%27fractalNoise%27/%3E%3CfeColorMatrix type=%27saturate%27 values=%270%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
              backgroundSize: 'auto 100%',
            }}
          />
        </div>

        {/* CONFETTI */}
        {!prefersReduce && confetti && width > 0 && height > 0 && (
          <Confetti width={width} height={height} numberOfPieces={220} recycle={false} gravity={0.3} />
        )}

        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-3">
            {/* testo di sinistra */}
            <div className="lg:col-span-2">
              <motion.div
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur"
                {...fade(0)}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Płatność zakończona pomyślnie
              </motion.div>

              <motion.h1
                className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
                {...fade(1)}
              >
                {title}
              </motion.h1>

              <motion.p className="mt-4 max-w-2xl text-pretty text-base text-neutral-200 sm:text-lg" {...fade(2)}>
                Teraz możesz przejść do logowania: kliknij <span className="font-semibold">„Zaloguj się”</span>,
                wpisz ten sam adres e-mail i odbierz <em>magic link</em>. Jeśli nie widzisz dostępu od razu,
                poczekaj kilka sekund — aktywacja odbywa się.
              </motion.p>

              {/* dettagli / error */}
              <motion.div {...fade(3)} className="mt-6 space-y-2 text-sm">
                {loading && <p className="opacity-80">Ładuję szczegóły…</p>}

                {!loading && data?.note && (
                  <p className="text-xs text-amber-300/90">{data.note}</p>
                )}

                {!loading && data?.email && (
                  <p><span className="text-neutral-400">E-mail:</span> {data.email}</p>
                )}

                {!loading && data?.subscriptionStatus && (
                  <p><span className="text-neutral-400">Status subskrypcji:</span> {data.subscriptionStatus}</p>
                )}

                {!loading && data && !data.ok && (
                  <p className="text-red-300">Coś poszło nie tak: {data.error ?? 'unknown_error'}</p>
                )}
              </motion.div>

              <motion.div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" {...fade(4)}>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(255,255,255,0.15)]
                             transition-[transform,opacity,box-shadow] hover:opacity-95 hover:shadow-[0_14px_36px_rgba(255,255,255,0.22)]
                             active:scale-[0.99]"
                >
                  Zaloguj się
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/10"
                >
                  Strona główna
                </Link>
              </motion.div>

              <motion.div className="mt-10 block lg:hidden" {...fade(5)}>
                <Image
                  src="/images/hero-mobile.webp"
                  alt="KaucjaFlow — widok mobilny"
                  width={1200}
                  height={1600}
                  priority
                  sizes="(max-width: 1024px) 100vw, 0vw"
                  className="h-auto w-full object-contain"
                />
              </motion.div>
            </div>

            {/* immagine destra */}
            <motion.div className="relative hidden items-end justify-end lg:flex" {...fade(2)}>
              <div className="relative h-[min(80vh,760px)] w-full">
                <Image
                  src="/images/hero-desk.webp"
                  alt="KaucjaFlow — interfejs na telefonie"
                  fill
                  priority
                  sizes="(min-width: 1024px) 33vw, 0vw"
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>

          {/* Card finale */}
          <motion.div
            className="relative mt-16 overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur md:p-12"
            {...fade(6)}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-60"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(251,191,36,0.08) 30%, transparent 60%)' }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
            <h2 className="mx-auto max-w-3xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Masz już dostęp. Zaloguj się jednym kliknięciem.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-200">
              Wpisz adres e-mail użyty przy zakupie i wyślij magic link. Dostęp możesz anulować w dowolnym momencie.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]
                           transition-[transform,opacity,box-shadow] hover:opacity-95 hover:shadow-[0_14px_36px_rgba(0,0,0,0.35)] active:scale-[0.99]"
              >
                Przejdź do logowania
              </Link>
            </div>
          </motion.div>
        </div>

        {/* accento conico */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-10%] top-[20%] -z-10 h-[40vh] w-[40vh] rounded-full blur-3xl
                     bg-[conic-gradient(from_210deg,theme(colors.emerald.400/.35),transparent_45%,theme(colors.amber.400/.25),transparent_75%)]"
        />
      </main>
      <LegalFooter />
    </>
  );
}
