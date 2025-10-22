'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export type PricingProps = {
  eyebrow?: string;
  title?: string;
  price?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  callTitle?: string;
  callSubtitle?: string;
  callHref?: string;
  callAvatarSrc?: string;
  className?: string;
};

export default function Pricing({
  eyebrow = 'Cennik',
  title = 'Do 31.12.2025 za darmo — od 01.01.2026 stała cena:',
  price = '29 PLN/mies.',
  subtitle = 'Mniej niż 1 PLN dziennie. Bez umów lojalnościowych. Anulacja 1-klik.',
  primaryCtaLabel = 'Załóż konto',
  primaryCtaHref = '/login',
  callTitle = 'Umów rozmowę',
  callSubtitle = '15-minutowa darmowa konsultacja z zespołem.',
  callHref = 'https://cal.com/kaucjaflow/start',
  callAvatarSrc = '/images/avatar.webp',
  className,
}: PricingProps) {
  const prefersReduce = useReducedMotion();
  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  return (
    <section
      id="pricing"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="pricing-title"
    >
      {/* background molto discreto, coerente (emerald/amber soft) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[40vh] opacity-40 blur-3xl
                        bg-[radial-gradient(closest-side,theme(colors.emerald.300/.20),transparent_60%)] 
                        dark:bg-[radial-gradient(closest-side,theme(colors.emerald.300/.12),transparent_60%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* Eyebrow / badge */}
        <motion.p
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium text-gray-800 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-gray-100"
          {...fade(0)}
        >
          {eyebrow}
        </motion.p>

        {/* Big neutral glass card */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:p-12 dark:border-white/15 dark:bg-white/10 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          {...fade(1)}
        >
          {/* leggerissimo accento diagonale (emerald/amber, molto soft) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-60"
            style={{
              background:
                'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(251,191,36,0.08) 30%, transparent 60%)',
            }}
          />

          {/* soft inner ring per “depth” */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" />

          <motion.h2
            id="pricing-title"
            className="mx-auto max-w-3xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
            {...fade(2)}
          >
            {title}
          </motion.h2>

          <motion.div
            className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl"
            {...fade(3)}
          >
            {price}
          </motion.div>

          <motion.p
            className="mx-auto mt-3 max-w-2xl text-sm text-gray-700 dark:text-gray-300"
            {...fade(4)}
          >
            {subtitle}
          </motion.p>

          <motion.div className="mt-8 flex justify-center" {...fade(5)}>
            <Link
              href={primaryCtaHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-[transform,opacity,box-shadow] hover:opacity-95 hover:shadow-[0_14px_36px_rgba(0,0,0,0.2)] active:scale-[0.99] dark:bg-white dark:text-black dark:shadow-[0_10px_30px_rgba(255,255,255,0.08)] dark:hover:shadow-[0_14px_36px_rgba(255,255,255,0.12)]"
            >
              {primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Divider */}
          <div className="mx-auto my-10 h-px w-full max-w-3xl bg-black/10 dark:bg-white/10" />

          {/* Book a call: stessa palette neutra + accento emerald leggero */}
          <motion.div
            className="mx-auto grid max-w-3xl grid-cols-1 items-center gap-4 rounded-xl border border-black/10 bg-white/50 p-4 text-left shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)] md:grid-cols-[1fr_auto] dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
            {...fade(6)}
          >
            <div>
              <h3 className="text-lg font-semibold tracking-tight"> {callTitle} </h3>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{callSubtitle}</p>
            </div>

            <Link
              href={callHref}
              className="inline-flex items-center justify-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-700 backdrop-blur transition-colors hover:bg-emerald-500/15 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-emerald-200 dark:hover:bg-emerald-300/15"
            >
              <span className="relative inline-flex h-6 w-6 overflow-hidden rounded-full ring-2 ring-emerald-500/50 dark:ring-emerald-300/50">
                <Image src={callAvatarSrc} alt="KaucjaFlow" fill sizes="24px" />
              </span>
              Book a call
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
