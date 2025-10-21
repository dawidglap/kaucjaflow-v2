'use client';

import React from 'react';

export type ContrastRow = {
  label: string;
  left: string;
  right: string;
};

export type ContrastTableProps = {
  leftTitle?: string;
  rightTitle?: string;
  rows?: ContrastRow[];
  className?: string;
};

const DEFAULT_ROWS: ContrastRow[] = [
  { label: 'Start', left: 'Dziś. Gratis do 31.12.2025', right: 'Niepewne terminy / różny poziom wsparcia' },
  { label: 'Dla mikro-sklepu', left: 'Tak — bez RVM i bez integracji', right: 'Często projektowane pod sieci' },
  { label: 'Offline', left: 'Tak', right: 'Zależnie od dostawcy' },
  { label: 'Szkolenie', left: '10 min i gotowe', right: 'PDF-y do czytania' },
  { label: 'Raporty', left: 'CSV/PDF 1-klik', right: 'Różnie, często zamknięte formaty' },
  { label: 'Cena', left: '29 PLN/mies. od 01.01.2026', right: '„To zależy” + ukryte koszty' },
];

export default function ContrastTable({
  leftTitle = 'KaucjaFlow',
  rightTitle = '„Poczekam na apkę operatora/państwa”',
  rows = DEFAULT_ROWS,
  className,
}: ContrastTableProps) {
  return (
    <section
      id="contrast"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="contrast-title"
    >
      <header className="mb-6">
        <h2 id="contrast-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Dlaczego nie czekać?
        </h2>
      </header>

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-black/5 text-left dark:bg-white/10">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">Kryterium</th>
              <th className="px-4 py-3 font-semibold">{leftTitle}</th>
              <th className="px-4 py-3 font-semibold">{rightTitle}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-black/10 dark:border-white/15">
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.label}</td>
                <td className="px-4 py-3">{r.left}</td>
                <td className="px-4 py-3">{r.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
