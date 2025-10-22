'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';

export type HeroProps = {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondary?: string;
  className?: string;
};

export default function Hero({
badge="⚡ Od 1.10.2025 — zero czasu na błędy",
title="Kaucje wchodzą. Twój sklep musi działać szybko — albo utknie w chaosie.",
subtitle="Przygotuj kasjerów w 3 minuty. Bez POS-ów, bez papierów, bez stresu.",
ctaLabel="Załóż konto GRATIS",
secondary="Już 300+ sklepów działa z KaucjaFlow. Nie czekaj do ostatniej chwili.",

  ctaHref = '/login',
  className,
}: HeroProps) {
  const prefersReduce = useReducedMotion();
  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  return (
    <section
      id="hero"
      className={`relative isolate overflow-hidden min-h-[100dvh] lg:h-[min(100dvh,1080px)] ${className || ''}`}
      aria-labelledby="hero-title"
    >
      {/* background */}
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

      {/* content grid: desktop 2/3 testo, 1/3 immagine */}
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        <div className="grid h-full grid-cols-1 items-center gap-10 lg:grid-cols-3">
          {/* testo: col-span 2 su desktop */}
          <div className="max-w-2xl lg:col-span-2">
            <motion.div
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-gray-800 backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:text-gray-100"
              {...fade(0)}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {badge}
            </motion.div>

            <motion.h1
              id="hero-title"
              className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
              {...fade(1)}
            >
              {title}
            </motion.h1>

            <motion.p
              className="mt-4 max-w-2xl text-pretty text-base text-gray-700 dark:text-gray-300 sm:text-lg"
              {...fade(2)}
            >
              {subtitle}
            </motion.p>

            <motion.div
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
              {...fade(3)}
            >
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-full bg-black px-7 py-3 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-[transform,opacity,box-shadow]
                           hover:opacity-95 hover:shadow-[0_10px_28px_rgba(0,0,0,0.2)]
                           active:scale-[0.99]
                           dark:bg-white dark:text-black dark:shadow-[0_6px_20px_rgba(255,255,255,0.08)] dark:hover:shadow-[0_10px_28px_rgba(255,255,255,0.12)]"
              >
                {ctaLabel}
              </Link>
              <span className="text-sm text-gray-600 dark:text-gray-300">{secondary}</span>
            </motion.div>

            <motion.ul
              className="mt-10 grid max-w-3xl grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-3"
              {...fade(4)}
            >
              <li className="rounded-lg border border-black/10 bg-white/60 px-3 py-2 backdrop-blur dark:border-white/15 dark:bg-white/10">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Offline-first</span>
                <span className="block text-xs opacity-80">działa bez internetu</span>
              </li>
              <li className="rounded-lg border border-black/10 bg-white/60 px-3 py-2 backdrop-blur dark:border-white/15 dark:bg-white/10">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Raporty 1-klik</span>
                <span className="block text-xs opacity-80">CSV/PDF dzienny/mies.</span>
              </li>
              <li className="rounded-lg border border-black/10 bg-white/60 px-3 py-2 backdrop-blur dark:border-white/15 dark:bg-white/10">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Bez RVM</span>
                <span className="block text-xs opacity-80">i bez integracji POS</span>
              </li>
            </motion.ul>

            {/* immagine mobile sotto al testo */}
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

          {/* immagine desktop: 1/3, senza card/crop */}
          <motion.div
            className="relative hidden items-end justify-end lg:flex"
            {...fade(2)}
          >
            {/* contenitore con altezza controllata */}
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
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[20%] -z-10 h-[40vh] w-[40vh] rounded-full blur-3xl
                   bg-[conic-gradient(from_210deg,theme(colors.emerald.400/.35),transparent_45%,theme(colors.amber.400/.25),transparent_75%)]
                   dark:bg-[conic-gradient(from_210deg,theme(colors.emerald.300/.25),transparent_45%,theme(colors.amber.300/.2),transparent_75%)]"
      />
    </section>
  );
}
