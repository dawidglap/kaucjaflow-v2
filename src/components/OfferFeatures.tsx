'use client';

import React from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import {
  LayoutGrid, WifiOff, FileDown, RotateCcw, Building2,
  PlugZap, GraduationCap, Languages,
} from 'lucide-react';

export type OfferFeaturesProps = {
  title?: string; // h2
  features?: Array<{ icon?: React.ComponentType<any>; text: string }>;
  className?: string;
};

const DEFAULT_FEATURES: NonNullable<OfferFeaturesProps['features']> = [
  { icon: LayoutGrid, text: 'Aplikacja POS-like: pełny ekran, ciemny tryb, duże przyciski.' },
  { icon: WifiOff, text: 'Offline-first: działa bez internetu, synchronizacja po powrocie sieci.' },
  { icon: FileDown, text: 'Raporty: CSV/PDF dzienny/miesięczny – 1 klik.' },
  { icon: RotateCcw, text: 'Cofnięcie (Undo): pomyłki nie blokują kolejki.' },
  { icon: Building2, text: 'Wielosklepowość: wiele lokali i kasjerów w jednym panelu.' },
  { icon: PlugZap, text: 'Brak przymusowych integracji POS (opcjonalne później).' },
  { icon: GraduationCap, text: 'Onboarding wideo (10 min): kasjerzy gotowi od razu.' },
  { icon: Languages, text: 'Interfejs po polsku, zrozumiały „dla pierwszoklasisty”.' },
];

export default function OfferFeatures({
  title = 'Co dostajesz',
  features,
  className,
}: OfferFeaturesProps) {
  const prefersReduce = useReducedMotion();

  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  // ✅ Garantisce un array non-undefined
  const items = features ?? DEFAULT_FEATURES;

  return (
    <section
      id="features"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="features-title"
    >
      {/* Background flair (discreto) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[10%] bottom-[-12%] h-[34vh] w-[34vh] rounded-full blur-3xl opacity-35
                        bg-[conic-gradient(from_220deg,theme(colors.emerald.400/.26),transparent_55%,theme(colors.amber.400/.2),transparent_75%)]
                        dark:bg-[conic-gradient(from_220deg,theme(colors.emerald.300/.22),transparent_55%,theme(colors.amber.300/.18),transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* Heading */}
        <motion.h2
          id="features-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          {...fade(0)}
        >
          {title}
        </motion.h2>

        {/* Cards: 1 → 2 → 4 colonne */}
        <motion.ul
          className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4"
          {...fade(1)}
        >
          {items.map((f, i) => {
            const Icon = f.icon ?? LayoutGrid;
            return (
              <li
                key={i}
                className="flex h-full flex-col rounded-xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/15 dark:bg-white/10"
              >
                <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                  <Icon className="h-4 w-4" />
                  Funkcja {i + 1}
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100">{f.text}</p>
              </li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
