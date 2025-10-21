'use client';

import React from 'react';
import { Quote } from 'lucide-react';

export type QuoteItem = {
  text: string;
  author?: string;
  roleOrPlace?: string;
};

export type SocialProofProps = {
  title?: string;
  quotes?: QuoteItem[];
  className?: string;
};

const DEFAULT_QUOTES: QuoteItem[] = [
  { text: '5 minut szkolenia i kolejki zniknęły.', author: 'Właściciel sklepu', roleOrPlace: 'Słupsk' },
  { text: 'Offline w piwnicy, a raport PDF podsyłam księgowej bez problemu.', author: 'Sklep osiedlowy', roleOrPlace: 'Gdańsk' },
  { text: 'Trzy duże kafle i koniec pytań „jak to nabić?”.', author: 'Kasjerka', roleOrPlace: 'Poznań' },
];

export default function SocialProof({
  title = 'Historie użytkowników',
  quotes = DEFAULT_QUOTES,
  className,
}: SocialProofProps) {
  return (
    <section
      id="social"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="social-title"
    >
      <header className="mb-6">
        <h2 id="social-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {quotes.map((q, i) => (
          <figure
            key={i}
            className="flex h-full flex-col justify-between rounded-lg border border-black/10 p-5 dark:border-white/15"
          >
            <blockquote className="text-sm text-gray-900 dark:text-gray-100">
              <Quote className="mb-2 h-5 w-5 opacity-60" />
              <p>„{q.text}”</p>
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
      </div>
    </section>
  );
}
