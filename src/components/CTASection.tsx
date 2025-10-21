'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export type CTASectionProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  bonus?: string;
  className?: string;
};

export default function CTASection({
  id = 'cta',
  title = 'Uruchom KaucjaFlow za darmo (do 31.12.2025)',
  subtitle = 'Zacznij dziś — od Nowego Roku tylko 29 PLN/mies. (mniej niż 1 PLN dziennie).',
  ctaLabel = 'Załóż konto',
  ctaHref = '/login',
  bonus = 'Bonus: szablon procedury + wideo-szkolenie dla kasjerów (10 min).',
  className,
}: CTASectionProps) {
  return (
    <section
      id={id}
      className={`mx-auto w-full max-w-6xl px-4 py-16 sm:py-24 ${className || ''}`}
      aria-labelledby="cta-title"
    >
      <div className="rounded-2xl border border-black/10 p-8 text-center dark:border-white/15">
        <h2
          id="cta-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
            {subtitle}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {bonus && (
          <p className="mt-4 text-xs text-gray-600 dark:text-gray-300">{bonus}</p>
        )}
      </div>
    </section>
  );
}
