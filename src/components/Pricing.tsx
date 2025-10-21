'use client';

import React from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';

export type PricingProps = {
  title?: string;
  freeUntil?: string;          // np. "31.12.2025"
  price?: string;              // np. "29 PLN/mies."
  note?: string;               // np. "Mniej niż 1 PLN dziennie."
  benefits?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

const DEFAULT_BENEFITS = [
  'Cena zablokowana dla wczesnych użytkowników',
  'Brak umów lojalnościowych',
  'Anulacja 1-klik',
];

export default function Pricing({
  title = 'Cennik',
  freeUntil = '31.12.2025',
  price = '29 PLN/mies.',
  note = 'Mniej niż 1 PLN dziennie.',
  benefits = DEFAULT_BENEFITS,
  ctaLabel = 'Uruchom za darmo',
  ctaHref = '/login',
  className,
}: PricingProps) {
  return (
    <section
      id="pricing"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="pricing-title"
    >
      <header className="mb-6 text-center">
        <h2 id="pricing-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs font-medium dark:border-white/20">
            <Tag className="h-4 w-4" />
            GRATIS do {freeUntil}
          </span>
        </p>
      </header>

      <div className="mx-auto max-w-md rounded-2xl border border-black/10 p-6 text-center dark:border-white/15">
        <div className="text-4xl font-semibold">{price}</div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{note}</div>

        <ul className="mt-6 space-y-2 text-left text-sm">
          {benefits.map((b, i) => (
            <li key={i} className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15">
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
