'use client';

import React from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { Check } from 'lucide-react';

export type ContrastRow = {
  label: string;
  left: string;
  right: string;
};

export type ContrastTableProps = {
  leftTitle?: string;
  rightTitle?: string;
  rows?: ContrastRow[];
  className?: string;
};

const DEFAULT_ROWS: ContrastRow[] = [
  { label: 'Start', left: 'Dziś. Gratis do 31.12.2025', right: 'Niepewne terminy / różny poziom wsparcia' },
  { label: 'Dla mikro-sklepu', left: 'Tak — bez RVM i bez integracji', right: 'Często projektowane pod sieci' },
  { label: 'Offline', left: 'Tak', right: 'Zależnie od dostawcy' },
  { label: 'Szkolenie', left: '10 min i gotowe', right: 'PDF-y do czytania' },
  { label: 'Raporty', left: 'CSV/PDF 1-klik', right: 'Różnie, często zamknięte formaty' },
  { label: 'Cena', left: '29 PLN/mies. od 01.01.2026', right: '„To zależy” + ukryte koszty' },
];

export default function ContrastTable({
  leftTitle = 'KaucjaFlow',
  rightTitle = '„Poczekam na apkę operatora/państwa”',
  rows = DEFAULT_ROWS,
  className,
}: ContrastTableProps) {
  const prefersReduce = useReducedMotion();
  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.05 * i, duration: prefersReduce ? 0.3 : 0.45 },
  });

  // opzionale: mostra un check verde quando il valore è "Tak" / "Yes" / "✓"
  const renderCell = (value: string) => {
    const v = value.trim().toLowerCase();
    const isYes = v === 'tak' || v === 'yes' || v === '✓' || v === '✔';
    if (isYes) {
      return (
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          </span>
          <span>Tak</span>
        </span>
      );
    }
    return value;
  };

  return (
    <section
      id="contrast"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="contrast-title"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* Heading */}
        <motion.h2
          id="contrast-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          {...fade(0)}
        >
          Dlaczego nie czekać?
        </motion.h2>

        {/* Wrapper con scroll orizzontale */}
        <motion.div
          className="mt-8 overflow-x-auto rounded-2xl border border-black/10 bg-black/5 dark:border-white/15 dark:bg-white/5"
          {...fade(1)}
        >
          <table className="min-w-[720px] w-full border-collapse text-sm">
            {/* Header scuro arrotondato */}
            <thead>
              <tr className="bg-zinc-900 text-white dark:bg-zinc-900">
                <th className="px-4 py-4 text-left font-medium rounded-tl-2xl">Kryterium</th>
                <th className="px-4 py-4 text-left font-semibold">{leftTitle}</th>
                <th className="px-4 py-4 text-left font-semibold rounded-tr-2xl">{rightTitle}</th>
              </tr>
            </thead>

            <tbody className="bg-transparent">
              {rows.map((r, i) => (
                <tr
                  key={i}
                  className="border-t border-black/10 dark:border-white/10"
                >
                  {/* Label con underline puntinata */}
                  <th
                    scope="row"
                    className="px-4 py-4 text-left font-medium text-gray-900 underline decoration-dotted underline-offset-4 dark:text-gray-100"
                  >
                    {r.label}
                  </th>

                  {/* Colonna sinistra */}
                  <td className="px-4 py-4 text-gray-900 dark:text-gray-100">
                    {renderCell(r.left)}
                  </td>

                  {/* Colonna destra */}
                  <td className="px-4 py-4 text-gray-900 dark:text-gray-100">
                    {renderCell(r.right)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Nota stile pricing-table (facoltativa) */}
        <motion.p
          className="mt-3 text-xs text-gray-600 dark:text-gray-300"
          {...fade(2)}
        >
          Tabela jest responsywna — przeciągnij w bok na małych ekranach.
        </motion.p>
      </div>
    </section>
  );
}
