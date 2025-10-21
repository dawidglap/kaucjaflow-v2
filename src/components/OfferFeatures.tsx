'use client';

import React from 'react';
import {
  LayoutGrid, WifiOff, FileDown, RotateCcw, Building2,
  PlugZap, GraduationCap, Languages
} from 'lucide-react';

export type OfferFeaturesProps = {
  title?: string;
  features?: Array<{ icon?: React.ComponentType<any>; text: string }>;
  className?: string;
};

const DEFAULT_FEATURES: OfferFeaturesProps['features'] = [
  { icon: LayoutGrid, text: 'Aplikacja POS-like: pełny ekran, ciemny tryb, duże przyciski.' },
  { icon: WifiOff, text: 'Offline-first: działa bez internetu, synchronizacja po powrocie sieci.' },
  { icon: FileDown, text: 'Raporty: CSV/PDF dzienny/miesięczny – 1 klik.' },
  { icon: RotateCcw, text: 'Cofnięcie (Undo): pomyłki nie blokują kolejki.' },
  { icon: Building2, text: 'Wielosklepowość: wiele lokali i kasjerów w jednym panelu.' },
  { icon: PlugZap, text: 'Brak przymusowych integracji POS (opcjonalne później).' },
  { icon: GraduationCap, text: 'Onboarding wideo (10 min): kasjerzy gotowi od razu.' },
  { icon: Languages, text: 'Interfejs po polsku, zrozumiały „dla pierwszoklasisty”.' },
];

export default function OfferFeatures({
  title = 'Co dostajesz',
  features = DEFAULT_FEATURES,
  className,
}: OfferFeaturesProps) {
  return (
    <section
      id="features"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="features-title"
    >
      <header className="mb-6">
        <h2 id="features-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((f, i) => {
          const Icon = f.icon ?? LayoutGrid;
          return (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm text-gray-900 dark:text-gray-100">{f.text}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
