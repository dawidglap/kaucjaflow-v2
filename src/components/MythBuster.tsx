'use client';

import React from 'react';
import { CircleX, CircleCheck } from 'lucide-react';

export type MythBusterProps = {
  myth?: string;
  fact?: string;
  note?: string;
  className?: string;
};

export default function MythBuster({
  myth = '„Państwo da jedną apkę.”',
  fact = 'System realizują licencjonowani operatorzy — sklep i tak potrzebuje prostego procesu kasowego i raportów.',
  note = 'KaucjaFlow ogarnia proces na kasie + raporty; bez czekania na integracje.',
  className,
}: MythBusterProps) {
  return (
    <section
      id="myth"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="myth-title"
    >
      <header className="mb-6">
        <h2 id="myth-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Mit vs Fakty
        </h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* MIT */}
        <div className="rounded-lg border border-black/10 p-5 dark:border-white/15">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
            <CircleX className="h-4 w-4" />
            Mit
          </div>
          <p className="text-sm text-gray-900 dark:text-gray-100">{myth}</p>
        </div>

        {/* FAKT */}
        <div className="rounded-lg border border-black/10 p-5 dark:border-white/15">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
            <CircleCheck className="h-4 w-4" />
            Fakt
          </div>
          <p className="text-sm text-gray-900 dark:text-gray-100">{fact}</p>
        </div>
      </div>

      {/* Nota dodatkowa */}
      {note && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          {note}
        </p>
      )}
    </section>
  );
}
