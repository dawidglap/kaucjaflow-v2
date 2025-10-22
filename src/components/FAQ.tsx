'use client';

import React from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export type FAQItem = { q: string; a: string };

export type FAQProps = {
  eyebrow?: string;     // piccolo titolo sopra
  title?: string;       // h2
  items?: FAQItem[];
  className?: string;
};

const DEFAULT_ITEMS: FAQItem[] = [
  {
    q: 'Czy muszę mieć RVM?',
    a: 'Nie. Dla mikro i małych sklepów KaucjaFlow działa bez automatu — to prosty proces na kasie.',
  },
  {
    q: 'Czy to zastępuje system operatora?',
    a: 'Nie. Operator zajmuje się zapleczem systemu; KaucjaFlow to frontend kasowy + raporty.',
  },
  {
    q: 'Czy działa offline?',
    a: 'Tak — dane synchronizują się automatycznie po powrocie internetu.',
  },
  {
    q: 'A jeśli operator udostępni swoją apkę?',
    a: 'Bez problemu: eksport CSV/PDF i migrujesz bez bólu.',
  },
];

export default function FAQ({
  eyebrow = 'Masz pytania?',
  title = 'FAQ',
  items = DEFAULT_ITEMS,
  className,
}: FAQProps) {
  const prefersReduce = useReducedMotion();
  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  return (
    <section
      id="faq"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="faq-title"
    >
      {/* Background flair (delicato, palette coerente) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[12%] bottom-[-12%] h-[34vh] w-[34vh] rounded-full blur-3xl opacity-35
                        bg-[conic-gradient(from_120deg,theme(colors.emerald.400/.18),transparent_55%,theme(colors.amber.400/.14),transparent_75%)]
                        dark:bg-[conic-gradient(from_120deg,theme(colors.emerald.300/.14),transparent_55%,theme(colors.amber.300/.12),transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* Eyebrow */}
        <motion.p
          className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          {...fade(0)}
        >
          {eyebrow}
        </motion.p>

        {/* Heading */}
        <motion.h2
          id="faq-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          {...fade(1)}
        >
          {title}
        </motion.h2>

        {/* Lista QA */}
        <motion.div
          className="mt-8 space-y-3"
          {...fade(2)}
        >
          {items.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-black/10 bg-white/60 p-4 backdrop-blur transition-colors open:bg-white/70 dark:border-white/15 dark:bg-white/10 dark:open:bg-white/10"
            >
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-3 outline-none"
                aria-controls={`faq-a-${i}`}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.q}
                </span>
                <HelpCircle
                  className="h-4 w-4 shrink-0 opacity-70 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>

              <p
                id={`faq-a-${i}`}
                className="mt-3 text-sm text-gray-700 dark:text-gray-300"
              >
                {item.a}
              </p>
            </details>
          ))}
        </motion.div>

        {/* Nota micro (opzionale) */}
        <motion.p
          className="mt-6 text-xs text-gray-600 dark:text-gray-300"
          {...fade(3 + items.length)}
        >
          Nie widzisz swojego pytania? Napisz do nas — dodamy je do FAQ.
        </motion.p>
      </div>
    </section>
  );
}
