'use client';

import React from 'react';
import { BadgeCheck, CalendarRange, Scale } from 'lucide-react';

export type ProofProps = {
  items?: string[];
  note?: string;
  className?: string;
};

export default function Proof({
  items = [
    'Zakres: PET (≤ 3 l), puszka (≤ 1 l), szkło wielokrotne (≤ 1,5 l).',
    'Stawki kaucji: 0,50 zł (PET), 0,50 zł (puszka), 1,00 zł (szkło wielokrotne).',
    'Start systemu: 1.10.2025; okres przejściowy do 31.12.2025.',
    'Sklepy <200 m²: PET/puszka – dobrowolnie; szkło wielokrotne sprzedane w sklepie – obowiązkowo.',
  ],
  note = 'KaucjaFlow wspiera proces kasowy i raporty – bez czekania na integracje i bez RVM.',
  className,
}: ProofProps) {
  return (
    <section
      id="proof"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="proof-title"
    >
      <header className="mb-6">
        <h2
          id="proof-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Konkrety (bez ogólników)
        </h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-black/10 p-5 dark:border-white/15">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
            <Scale className="h-4 w-4" />
            Zakres i stawki
          </div>
          <ul className="list-inside space-y-2 text-sm text-gray-900 dark:text-gray-100">
            <li>{items[0]}</li>
            <li>{items[1]}</li>
          </ul>
        </div>

        <div className="rounded-lg border border-black/10 p-5 dark:border-white/15">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
            <CalendarRange className="h-4 w-4" />
            Daty i obowiązki
          </div>
          <ul className="list-inside space-y-2 text-sm text-gray-900 dark:text-gray-100">
            <li>{items[2]}</li>
            <li>{items[3]}</li>
          </ul>
        </div>
      </div>

      <p className="mt-4 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <BadgeCheck className="h-4 w-4" />
        {note}
      </p>
    </section>
  );
}
