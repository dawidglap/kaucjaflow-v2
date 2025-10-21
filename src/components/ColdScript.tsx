'use client';

import React from 'react';
import { PhoneCall, Copy } from 'lucide-react';

export type ColdScriptProps = {
  title?: string;
  script?: string;
  className?: string;
};

const DEFAULT_SCRIPT = `Dzień dobry, tu [Imię] z KaucjaFlow. Od 1.10 kaucje są obowiązkowe — wiele małych sklepów traci czas na kasie.
Mamy darmową apkę do 31.12: 3 duże przyciski (PLASTIC/ALU/SZKŁO) i raport PDF na koniec dnia.
Uruchamiamy w 10 minut, bez integracji. Wyślę link? Jeśli jutro nie będzie ‘wow’, kasujemy konto — zero ryzyka.`;

export default function ColdScript({
  title = 'Mikro-skrypt do telefonu / DM',
  script = DEFAULT_SCRIPT,
  className,
}: ColdScriptProps) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(script);
    } catch {}
  };

  return (
    <section
      id="cold"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="cold-title"
    >
      <header className="mb-6 flex items-center gap-2">
        <PhoneCall className="h-5 w-5" />
        <h2 id="cold-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </header>

      <div className="rounded-xl border border-black/10 p-5 dark:border-white/15">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-gray-100">
{script}
        </pre>
        <div className="mt-4">
          <button
            onClick={copy}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-black hover:text-white dark:border-white/20 dark:hover:bg-white dark:hover:text-black"
          >
            <Copy className="h-4 w-4" />
            Skopiuj skrypt
          </button>
        </div>
      </div>
    </section>
  );
}
