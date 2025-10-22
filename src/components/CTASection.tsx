'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export type CTASectionProps = {
  id?: string;
  eyebrow?: string;     // mały tytuł nad CTA
  title?: string;       // h2
  subtitle?: string;    // krótki opis
  ctaLabel?: string;
  ctaHref?: string;
  bonus?: string;       // mała linijka pod przyciskiem
  className?: string;
};

export default function CTASection({
  id = 'cta',
  eyebrow = 'Zacznij teraz',
  title = 'Uruchom KaucjaFlow za darmo (do 31.12.2025)',
  subtitle = 'Od 01.01.2026 — tylko 29 PLN/mies. (mniej niż 1 PLN dziennie).',
  ctaLabel = 'Załóż konto',
  ctaHref = '/login',
  bonus = 'W zestawie: szablon procedury + wideo-szkolenie dla kasjerów (10 min).',
  className,
}: CTASectionProps) {
  const prefersReduce = useReducedMotion();
  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  return (
    <section
      id={id}
      className={`relative isolate ${className || ''}`}
      aria-labelledby="cta-title"
    >
      {/* tło bardzo subtelne w naszej palecie */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[12%] top-[-12%] h-[36vh] w-[36vh] rounded-full blur-3xl opacity-35
                        bg-[conic-gradient(from_220deg,theme(colors.emerald.400/.18),transparent_55%,theme(colors.amber.400/.14),transparent_75%)]
                        dark:bg-[conic-gradient(from_220deg,theme(colors.emerald.300/.14),transparent_55%,theme(colors.amber.300/.12),transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* eyebrow */}
        <motion.p
          className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          {...fade(0)}
        >
          {eyebrow}
        </motion.p>

        {/* karta CTA */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:p-12 dark:border-white/15 dark:bg-white/10 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          {...fade(1)}
        >
          {/* miękki akcent diagonalny */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-60"
            style={{
              background:
                'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(251,191,36,0.08) 30%, transparent 60%)',
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" />

          <motion.h2
            id="cta-title"
            className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
            {...fade(2)}
          >
            {title}
          </motion.h2>

          {subtitle && (
            <motion.p
              className="mx-auto mt-3 max-w-2xl text-sm text-gray-700 dark:text-gray-300"
              {...fade(3)}
            >
              {subtitle}
            </motion.p>
          )}

          <motion.div className="mt-7 flex justify-center" {...fade(4)}>
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-[transform,opacity,box-shadow] hover:opacity-95 hover:shadow-[0_14px_36px_rgba(0,0,0,0.2)] active:scale-[0.99] dark:bg-white dark:text-black dark:shadow-[0_10px_30px_rgba(255,255,255,0.08)] dark:hover:shadow-[0_14px_36px_rgba(255,255,255,0.12)]"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {bonus && (
            <motion.p
              className="mt-4 text-xs text-gray-600 dark:text-gray-300"
              {...fade(5)}
            >
              {bonus}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
