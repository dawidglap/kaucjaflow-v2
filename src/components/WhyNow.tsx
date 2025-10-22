'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { CalendarDays, Play } from 'lucide-react';

export type WhyNowProps = {
  startDate?: string;
  bullets?: string[];
  /** Poster 16:9 (desktop) – es. /images/kaucjaflow-poster-16x9.jpg */
  posterSrc?: string;
  /** Poster 9:16 (mobile/portrait) – es. /images/kaucjaflow-poster-9x16.jpg */
  posterVerticalSrc?: string;
  /** Video 16:9 – es. /videos/kaucjaflow.mp4 */
  videoSrc?: string;
  /** Video 9:16 – es. /videos/kaucjaflow-vertical.mp4 */
  verticalVideoSrc?: string;
  /** Soglia width per “mobile” (px) */
  mobileBreakpoint?: number;
  /** Se true, usa SOLO l’orientamento (ignora breakpoint) */
  verticalByOrientationOnly?: boolean;
  className?: string;
};

/** Hook semplice: ritrova width + orientamento */
function useViewport(mobileBreakpoint = 768) {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return { width: 1200, portrait: false };
    return {
      width: window.innerWidth,
      portrait: window.matchMedia?.('(orientation: portrait)').matches ?? false,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () =>
      setState({
        width: window.innerWidth,
        portrait: window.matchMedia?.('(orientation: portrait)').matches ?? false,
      });

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    const mql = window.matchMedia?.('(orientation: portrait)');
    const onMql = () => onResize();
    mql?.addEventListener?.('change', onMql);

    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      mql?.removeEventListener?.('change', onMql);
    };
  }, []);

  const isMobileWidth = state.width < mobileBreakpoint;
  return { ...state, isMobileWidth };
}

export default function WhyNow({
  startDate = '1 października 2025',
  bullets = [
    'Kaucje 0,50 zł (PET/puszka) i 1,00 zł (szkło wielokrotne).',
    'Klienci oddają opakowania tu i teraz — liczy się szybkość obsługi.',
    'Okres przejściowy do 31.12.2025 — idealny moment na wdrożenie prostego procesu.',
  ],
  posterSrc = '/images/kaucjaflow-poster-16x9.jpg',
  posterVerticalSrc = '/images/kaucjaflow-poster-9x16.jpg',
  videoSrc = '/videos/kaucjaflow.mp4',
  verticalVideoSrc = '/videos/kaucjaflow-vertical.mp4',
  mobileBreakpoint = 768,
  verticalByOrientationOnly = false,
  className,
}: WhyNowProps) {
  const prefersReduce = useReducedMotion();
  const { isMobileWidth, portrait } = useViewport(mobileBreakpoint);
  const useVertical = verticalByOrientationOnly ? portrait : portrait || isMobileWidth;

  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  const { src, poster } = useMemo(() => {
    if (useVertical) {
      return {
        src: verticalVideoSrc ?? videoSrc,
        poster: posterVerticalSrc ?? posterSrc,
      };
    }
    return {
      src: videoSrc,
      poster: posterSrc,
    };
  }, [useVertical, videoSrc, verticalVideoSrc, posterSrc, posterVerticalSrc]);

  return (
    <section
      id="whynow"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="whynow-title"
    >
      {/* Background flair */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[-10%] h-[36vh] w-[36vh] rounded-full blur-3xl opacity-35
                        bg-[conic-gradient(from_140deg,theme(colors.emerald.400/.28),transparent_55%,theme(colors.amber.400/.22),transparent_75%)]
                        dark:bg-[conic-gradient(from_140deg,theme(colors.emerald.300/.22),transparent_55%,theme(colors.amber.300/.18),transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* Eyebrow */}
        <motion.p
          className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          {...fade(0)}
        >
          <CalendarDays className="h-4 w-4" />
          Start systemu
        </motion.p>

        {/* Heading */}
        <motion.h2
          id="whynow-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          {...fade(1)}
        >
          Dlaczego teraz?
        </motion.h2>

        {/* Lead */}
        <motion.p
          className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300"
          {...fade(2)}
        >
          System kaucji działa od <strong>{startDate}</strong>. Zobacz w wideo poniżej,
          jak przygotować kasę w 3 minuty — bez kolejek i chaosu.
        </motion.p>

        {/* Video Card */}
        <motion.div
          className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white/60 backdrop-blur
                     dark:border-white/15 dark:bg-white/10"
          {...fade(3)}
        >
          <figure className="relative">
            <div className="relative w-full">
              {/* ratio inline: zero dipendenza dal plugin aspect-ratio */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: useVertical ? '177.78%' /* 9/16 */ : '56.25%' /* 16/9 */,
                }}
              >
                <video
                  key={src + (useVertical ? '-v' : '-h')}   /* forza re-render allo switch */
                  src={src}                                  /* src diretto = poster affidabile in Safari */
                  className="absolute inset-0 h-full w-full"
                  controls
                  playsInline
                  preload="none"                             /* mostra il poster subito */
                  poster={poster}
                  aria-label="Dlaczego teraz? — wideo wyjaśniające KaucjaFlow"
                  controlsList="nodownload noplaybackrate"
                />
              </div>
            </div>

            {/* Ikona play overlay (decorativa) */}
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-white/40 bg-black/20 p-3 backdrop-blur-sm opacity-0 transition-opacity duration-300 hover:opacity-100">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>

            <figcaption className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
              Krótkie wprowadzenie: obsługa kaucji, raport na 1 klik, tryb offline.
            </figcaption>
          </figure>
        </motion.div>

        {/* Bullets (opcjonalne) */}
        {bullets?.length ? (
          <motion.ul
            className="mt-6 grid grid-cols-1 items-stretch gap-3 md:grid-cols-3"
            {...fade(4)}
          >
            {bullets.map((b, i) => (
              <li
                key={i}
                className="rounded-xl border border-black/10 bg-white/60 px-4 py-3 text-sm text-gray-900 backdrop-blur
                           dark:border-white/15 dark:bg-white/10 dark:text-gray-100"
              >
                {b}
              </li>
            ))}
          </motion.ul>
        ) : null}

        {/* Micro chips */}
        <motion.div
          className="mt-6 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300"
          {...fade(5)}
        >
          <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 backdrop-blur dark:border-white/15 dark:bg-white/10">
            Offline-first
          </span>
          <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 backdrop-blur dark:border-white/15 dark:bg-white/10">
            Raport dzienny/miesięczny — 1 klik
          </span>
          <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 backdrop-blur dark:border-white/15 dark:bg-white/10">
            Onboarding 10 min
          </span>
        </motion.div>
      </div>
    </section>
  );
}
