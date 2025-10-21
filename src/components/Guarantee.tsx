'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export type GuaranteeProps = {
  title?: string;
  points?: string[];
  className?: string;
};

const DEFAULT_POINTS = [
  'Rezygnacja 1-klik — kiedy chcesz.',
  'Jeśli w 24 h nie skrócisz kolejek i nie uprościsz pracy kasjera — i tak masz gratis do 31.12.2025.',
];

export default function Guarantee({
  title = 'Gwarancja (odwrócenie ryzyka)',
  points = DEFAULT_POINTS,
  className,
}: GuaranteeProps) {
  return (
    <section
      id="guarantee"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="guarantee-title"
    >
      <header className="mb-6 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5" />
        <h2 id="guarantee-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {points.map((p, i) => (
          <li key={i} className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/15">
            {p}
          </li>
        ))}
      </ul>
    </section>
  );
}
