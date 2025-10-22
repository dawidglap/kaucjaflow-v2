'use client';

import React from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { CircleX, CircleCheck, Info, Sparkles } from 'lucide-react';

export type MythBusterProps = {
  eyebrow?: string;         // es. "Fakty i mity"
  title?: string;           // h2
  sublead?: string;         // breve spiegazione (opzionale)
  myth?: string;
  fact?: string;
  note?: string;
  className?: string;
};

export default function MythBuster({
  eyebrow = 'Fakty i mity',
  title = 'Mit vs Fakty',
  sublead = 'Porządkujemy najczęstsze wątpliwości dotyczące systemu kaucyjnego w sklepach.',
  myth = '„Państwo da jedną, oficjalną apkę do wszystkiego.”',
  fact = 'System realizują licencjonowani operatorzy; sklep nadal potrzebuje własnego procesu kasowego i raportów.',
  note = 'KaucjaFlow ogarnia front kasowy + raporty — bez czekania na integracje i bez RVM.',
  className,
}: MythBusterProps) {
  const prefersReduce = useReducedMotion();

  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  return (
    <section
      id="myth"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="myth-title"
    >
      {/* Background flair (discreto) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[8%] top-[-8%] h-[34vh] w-[34vh] rounded-full blur-3xl opacity-35
                        bg-[conic-gradient(from_260deg,theme(colors.emerald.400/.28),transparent_55%,theme(colors.amber.400/.22),transparent_75%)]
                        dark:bg-[conic-gradient(from_260deg,theme(colors.emerald.300/.22),transparent_55%,theme(colors.amber.300/.18),transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* Eyebrow */}
        <motion.p
          className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          {...fade(0)}
        >
          <Sparkles className="h-4 w-4" />
          {eyebrow}
        </motion.p>

        {/* Heading */}
        <motion.h2
          id="myth-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          {...fade(1)}
        >
          {title}
        </motion.h2>

        {/* Sublead (opzionale) */}
        {sublead && (
          <motion.p
            className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300"
            {...fade(2)}
          >
            {sublead}
          </motion.p>
        )}

        {/* Cards: 1 col mobile, 2 col desktop */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* MIT */}
          <motion.article
            aria-labelledby="myth-card-title"
            className="flex h-full flex-col rounded-xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/15 dark:bg-white/10"
            {...fade(3)}
          >
            <h3
              id="myth-card-title"
              className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300"
            >
              <CircleX className="h-4 w-4" />
              Mit
            </h3>
            <p className="text-sm text-gray-900 dark:text-gray-100">{myth}</p>
          </motion.article>

          {/* FAKT */}
          <motion.article
            aria-labelledby="fact-card-title"
            className="flex h-full flex-col rounded-xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/15 dark:bg-white/10"
            {...fade(4)}
          >
            <h3
              id="fact-card-title"
              className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300"
            >
              <CircleCheck className="h-4 w-4" />
              Fakt
            </h3>
            <p className="text-sm text-gray-900 dark:text-gray-100">{fact}</p>
          </motion.article>
        </div>

        {/* Nota full-width */}
        {note && (
          <motion.aside
            className="mt-5 inline-flex items-start gap-2 rounded-xl border border-black/10 bg-white/60 p-4 text-sm text-gray-800 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-gray-100"
            {...fade(5)}
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
            <span>{note}</span>
          </motion.aside>
        )}
      </div>
    </section>
  );
}
