'use client';

import React from 'react';
import { Scale } from 'lucide-react';

export type LegalFooterProps = {
  text?: string;
  className?: string;
};

const DEFAULT_TEXT =
  'Zakres i stawki: PET/puszka 0,50 zł; szkło wielokrotne 1,00 zł. Start 1.10.2025; okres przejściowy do 31.12.2025. ' +
  'Brak jednej „państwowej apki” — działają operatorzy z zezwoleniami. KaucjaFlow wspiera proces kasowy i raporty sklepu.';

export default function LegalFooter({ text = DEFAULT_TEXT, className }: LegalFooterProps) {
  return (
    <section
      id="legal"
      className={`mx-auto w-full max-w-6xl px-4 pb-12 ${className || ''}`}
      aria-labelledby="legal-title"
    >
      <div className="rounded-xl border border-black/10 p-5 text-xs text-gray-600 dark:border-white/15 dark:text-gray-300">
        <div className="mb-2 inline-flex items-center gap-2 font-medium">
          <Scale className="h-4 w-4" />
          <span id="legal-title">Informacja prawna (skrót)</span>
        </div>
        <p className="text-pretty">{text}</p>
      </div>
    </section>
  );
}
