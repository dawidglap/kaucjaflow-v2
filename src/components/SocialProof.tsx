'use client';

import React from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { Quote } from 'lucide-react';

export type QuoteItem = {
  text: string;
  author?: string;
  roleOrPlace?: string;
};

export type SocialProofProps = {
  eyebrow?: string;   // piccolo titolo sopra
  title?: string;     // h2
  quotes?: QuoteItem[];
  className?: string;
};

const DEFAULT_QUOTES: QuoteItem[] = [
  { text: '5 minut szkolenia i kolejki zniknęły.', author: 'Właściciel sklepu', roleOrPlace: 'Słupsk' },
  { text: 'Offline w piwnicy, a raport PDF podsyłam księgowej bez problemu.', author: 'Sklep osiedlowy', roleOrPlace: 'Gdańsk' },
  { text: 'Trzy duże kafle i koniec pytań „jak to nabić?”.', author: 'Kasjerka', roleOrPlace: 'Poznań' },
];

export default function SocialProof({
  eyebrow = 'Zaufanie',
  title = 'Historie użytkowników',
  quotes = DEFAULT_QUOTES,
  className,
}: SocialProofProps) {
  const prefersReduce = useReducedMotion();

  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  return (
    <section
      id="social"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="social-title"
    >
      {/* flair di sfondo discreto */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[12%] top-[-10%] h-[30vh] w-[30vh] rounded-full blur-3xl opacity-35
                        bg-[conic-gradient(from_260deg,theme(colors.emerald.400/.26),transparent_55%,theme(colors.amber.400/.2),transparent_75%)]
                        dark:bg-[conic-gradient(from_260deg,theme(colors.emerald.300/.22),transparent_55%,theme(colors.amber.300/.18),transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* eyebrow */}
        <motion.p
          className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          {...fade(0)}
        >
          {eyebrow}
        </motion.p>

        {/* heading */}
        <motion.h2
          id="social-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          {...fade(1)}
        >
          {title}
        </motion.h2>

        {/* quotes: 1 → 3 colonne */}
        <motion.div
          className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
          {...fade(2)}
        >
          {quotes.map((q, i) => (
            <figure
              key={i}
              className="flex h-full flex-col justify-between rounded-xl border border-black/10 bg-white/60 p-6 backdrop-blur dark:border-white/15 dark:bg-white/10"
            >
              <blockquote className="text-sm text-gray-900 dark:text-gray-100">
                <Quote className="mb-3 h-5 w-5 opacity-60" aria-hidden />
                <p className="text-pretty leading-relaxed">„{q.text}”</p>
              </blockquote>

              {(q.author || q.roleOrPlace) && (
                <figcaption className="mt-4 text-xs text-gray-600 dark:text-gray-300">
                  {q.author && <span className="font-medium">{q.author}</span>}
                  {q.author && q.roleOrPlace && <span> — </span>}
                  {q.roleOrPlace}
                </figcaption>
              )}
            </figure>
          ))}
        </motion.div>

        {/* micro nota opzionale */}
        {/* <motion.p
          className="mt-6 text-xs text-gray-600 dark:text-gray-300"
          {...fade(2 + quotes.length)}
        >
          Chcesz dodać logo partnera lub case study dłuższe? Dorzucimy karuzelę obrazków w tym samym stylu.
        </motion.p> */}
      </div>
    </section>
  );
}
