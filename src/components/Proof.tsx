'use client';

import React from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { BadgeCheck, CalendarRange, Scale, ShieldAlert } from 'lucide-react';

export type ProofProps = {
  title?: string;
  items?: string[]; // [zakres, stawki, start/przejściowy, obowiązki <200m2]
  note?: string;
  className?: string;
};

export default function Proof({
  title = 'Konkrety (bez ogólników)',
  items = [
    'Zakres: PET (≤ 3 l), puszka (≤ 1 l), szkło wielokrotne (≤ 1,5 l).',
    'Stawki kaucji: 0,50 zł (PET), 0,50 zł (puszka), 1,00 zł (szkło wielokrotne).',
    'Start systemu: 1.10.2025; okres przejściowy do 31.12.2025.',
    'Sklepy <200 m²: PET/puszka – dobrowolnie; szkło wielokrotne sprzedane w sklepie – obowiązkowo.',
  ],
  note = 'KaucjaFlow wspiera proces kasowy i raporty – bez czekania na integracje i bez RVM.',
  className,
}: ProofProps) {
  const prefersReduce = useReducedMotion();

  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  return (
    <section
      id="proof"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="proof-title"
    >
      {/* Flair di sfondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[-6%] h-[32vh] w-[32vh] rounded-full blur-3xl opacity-35
                        bg-[conic-gradient(from_120deg,theme(colors.emerald.400/.26),transparent_55%,theme(colors.amber.400/.2),transparent_75%)]
                        dark:bg-[conic-gradient(from_120deg,theme(colors.emerald.300/.22),transparent_55%,theme(colors.amber.300/.18),transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* Heading */}
        <motion.h2
          id="proof-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          {...fade(0)}
        >
          {title}
        </motion.h2>

        {/* Dwie karty: 1 kol → 2 kol */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Zakres i stawki */}
          <motion.article
            aria-labelledby="proof-scope-title"
            className="rounded-xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/15 dark:bg-white/10"
            {...fade(1)}
          >
            <h3
              id="proof-scope-title"
              className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300"
            >
              <Scale className="h-4 w-4" />
              Zakres i stawki
            </h3>
            <ul className="list-inside space-y-2 text-sm text-gray-900 dark:text-gray-100">
              <li>{items[0]}</li>
              <li>{items[1]}</li>
            </ul>
          </motion.article>

          {/* Daty i obowiązki */}
          <motion.article
            aria-labelledby="proof-dates-title"
            className="rounded-xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/15 dark:bg-white/10"
            {...fade(2)}
          >
            <h3
              id="proof-dates-title"
              className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300"
            >
              <CalendarRange className="h-4 w-4" />
              Daty i obowiązki
            </h3>
            <ul className="list-inside space-y-2 text-sm text-gray-900 dark:text-gray-100">
              <li>{items[2]}</li>
              <li>{items[3]}</li>
            </ul>
          </motion.article>
        </div>

        {/* Nota / disclaimer */}
        <motion.aside
          className="mt-5 inline-flex items-start gap-2 rounded-xl border border-black/10 bg-white/60 p-4 text-sm text-gray-800 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-gray-100"
          {...fade(3)}
        >
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
          <span>{note}</span>
        </motion.aside>

        {/* Tip facoltativo (puoi rimuoverlo) */}
        <motion.p
          className="mt-3 inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
          {...fade(4)}
        >
          <ShieldAlert className="h-3.5 w-3.5 opacity-80" />
          Jeśli chcesz, podmienimy te punkty na konkretne cytaty z regulacji w stopce prawnej.
        </motion.p>
      </div>
    </section>
  );
}
