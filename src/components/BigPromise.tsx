'use client';

import React from 'react';
import { CheckCircle2, WifiOff, Timer, FileSpreadsheet, Undo2, MonitorSmartphone } from 'lucide-react';

export type BigPromiseProps = {
  headline?: string;
  bullets?: string[];
  className?: string;
};

const DEFAULTS = {
  headline:
    'W 1 dzień uruchomisz prosty proces kaucji, który każdy kasjer ogarnie po 5 minutach.',
  bullets: [
    '3 duże kafle: PLASTIC • ALU • SZKŁO – szybciej niż skan cen.',
    'Działa offline – synchronizacja, gdy wróci sieć.',
    'Raporty CSV/PDF na klik – księgowość i operator zadowoleni.',
    'Cofnięcie operacji (Undo) – pomyłki nie spowalniają kolejki.',
    'Bez RVM i bez koniecznych integracji z POS.',
    'Desktop + mobile (full-screen) – jedna prosta logika.',
  ],
};

const ICONS = [CheckCircle2, WifiOff, FileSpreadsheet, Undo2, MonitorSmartphone, Timer];

export default function BigPromise({
  headline = DEFAULTS.headline,
  bullets = DEFAULTS.bullets,
  className,
}: BigPromiseProps) {
  return (
    <section
      id="bigpromise"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="bigpromise-title"
    >
      <header className="mb-6">
        <h2
          id="bigpromise-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Wielka Obietnica
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{headline}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {bullets.map((b, i) => {
          const Icon = ICONS[i % ICONS.length] || CheckCircle2;
          return (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm text-gray-900 dark:text-gray-100">{b}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
