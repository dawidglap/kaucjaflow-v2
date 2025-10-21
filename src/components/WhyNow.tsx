'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Zap, Clock } from 'lucide-react';

export type WhyNowProps = {
  startDate?: string;
  bullets?: string[];
  className?: string;
};

export default function WhyNow({
  startDate = '1 października 2025',
  bullets = [
    'Kaucje 0,50 zł (PET/puszka) i 1,00 zł (szkło wielokrotne).',
    'Klienci oddają opakowania tu i teraz — liczy się szybkość obsługi.',
    'Okres przejściowy do 31.12.2025 — idealny moment na wdrożenie prostego procesu.',
  ],
  className,
}: WhyNowProps) {
  const prefersReduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: prefersReduce ? 0 : 12 },
    show: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.06 * i, duration: 0.5, ease: 'easeOut' },
    }),
  };

  const ICONS = [Zap, Clock, Clock];

  return (
    <section
      id="whynow"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="whynow-title"
    >
      {/* Subtle background flair */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[-10%] h-[36vh] w-[36vh] rounded-full blur-3xl opacity-35
                        bg-[conic-gradient(from_140deg,theme(colors.emerald.400/.28),transparent_55%,theme(colors.amber.400/.22),transparent_75%)]
                        dark:bg-[conic-gradient(from_140deg,theme(colors.emerald.300/.22),transparent_55%,theme(colors.amber.300/.18),transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* Eyebrow */}
        <motion.p
          className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
        >
          <CalendarDays className="h-4 w-4" />
          Start systemu
        </motion.p>

        {/* Heading */}
        <motion.h2
          id="whynow-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
        >
          Dlaczego teraz?
        </motion.h2>

        {/* Lead */}
        <motion.p
          className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
        >
          System kaucji działa od <strong>{startDate}</strong>. To moment, by
          ułożyć prosty proces na kasie i uniknąć kolejek.
        </motion.p>

        {/* Bullets — 1 col mobile, 3 cols desktop */}
        <motion.ul
          className="mt-8 grid grid-cols-1 items-stretch gap-4 md:grid-cols-3"
          initial="hidden"
          animate="show"
        >
          {bullets.map((b, i) => {
            const Icon = ICONS[i % ICONS.length] || Clock;
            return (
              <motion.li
                key={i}
                className="flex h-full flex-col rounded-xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/15 dark:bg-white/10"
                variants={fadeUp}
                custom={3 + i}
              >
                <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                  <Icon className="h-4 w-4" />
                  Punkt {i + 1}
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100">{b}</p>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* Micro chips */}
        <motion.div
          className="mt-6 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={bullets.length + 4}
        >
          <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 backdrop-blur dark:border-white/15 dark:bg-white/10">
            Szybciej na kasie
          </span>
          <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 backdrop-blur dark:border-white/15 dark:bg-white/10">
            Mniej pytań od klientów
          </span>
          <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 backdrop-blur dark:border-white/15 dark:bg-white/10">
            Mniej stresu dla kasjera
          </span>
        </motion.div>
      </div>
    </section>
  );
}
