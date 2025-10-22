'use client';

import React from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { ShieldCheck, Check } from 'lucide-react';

export type GuaranteeProps = {
  eyebrow?: string;   // mały tytuł nad sekcją
  title?: string;     // h2
  lead?: string;      // jedno zdanie pod tytułem
  points?: string[];  // gwarancje jako "chip-y"
  className?: string;
};

const DEFAULT_POINTS = [
  'Rezygnacja 1-klik — kiedy chcesz.',
  'Jeśli w 24 h nie skrócisz kolejek i nie uprościsz pracy kasjera — i tak masz gratis do 31.12.2025.',
];

export default function Guarantee({
  eyebrow = 'Odwrócenie ryzyka',
  title = 'Gwarancja KaucjaFlow',
  lead = 'Wdrażasz dziś, testujesz w swoim sklepie. Zero ryzyka po Twojej stronie.',
  points = DEFAULT_POINTS,
  className,
}: GuaranteeProps) {
  const prefersReduce = useReducedMotion();

  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  return (
    <section
      id="guarantee"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="guarantee-title"
    >
      {/* delikatny flair w naszej palecie */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[-10%] h-[36vh] w-[36vh] rounded-full blur-3xl opacity-35
                        bg-[conic-gradient(from_100deg,theme(colors.emerald.400/.18),transparent_55%,theme(colors.amber.400/.14),transparent_75%)]
                        dark:bg-[conic-gradient(from_100deg,theme(colors.emerald.300/.14),transparent_55%,theme(colors.amber.300/.12),transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* eyebrow */}
        <motion.p
          className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          {...fade(0)}
        >
          <ShieldCheck className="h-4 w-4" />
          {eyebrow}
        </motion.p>

        {/* karta guarantee */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-8 backdrop-blur dark:border-white/15 dark:bg-white/10"
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

          <header className="mb-4">
            <h2
              id="guarantee-title"
              className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-gray-700 dark:text-gray-300">{lead}</p>
          </header>

          {/* chips: 1 → 2 kolumny */}
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {points.map((p, i) => (
              <motion.li
                key={i}
                className="inline-flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-gray-900 backdrop-blur dark:border-emerald-300/25 dark:bg-emerald-300/10 dark:text-gray-100"
                {...fade(2 + i)}
              >
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
                </span>
                <span>{p}</span>
              </motion.li>
            ))}
          </ul>

          {/* mikro doprecyzowanie */}
          <p className="mt-4 text-xs text-gray-600 dark:text-gray-300">
            Całość zgodna z okresem przejściowym: do 31.12.2025 gratis, potem 29 PLN/mies.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
