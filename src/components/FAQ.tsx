'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

export type FAQItem = { q: string; a: string };

export type FAQProps = {
  title?: string;
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
  title = 'FAQ',
  items = DEFAULT_ITEMS,
  className,
}: FAQProps) {
  return (
    <section
      id="faq"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="faq-title"
    >
      <header className="mb-6">
        <h2 id="faq-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </header>

      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-lg border border-black/10 p-4 transition-colors open:bg-black/5 dark:border-white/15 dark:open:bg-white/10"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <span className="text-sm font-medium">{item.q}</span>
              <HelpCircle className="h-4 w-4 opacity-70 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
