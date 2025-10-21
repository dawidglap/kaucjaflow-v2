'use client';

import React from 'react';
import { UserPlus, Touchpad, FileSpreadsheet } from 'lucide-react';

export type HowStep = { title: string; text: string; icon?: React.ComponentType<any> };

export type HowItWorksProps = {
  title?: string;
  steps?: HowStep[];
  className?: string;
};

const DEFAULT_STEPS: HowStep[] = [
  { title: 'Rejestracja', text: 'Załóż konto, dodaj sklep i kasjerów (60 sek.).', icon: UserPlus },
  { title: 'Tryb POS', text: 'Trzy kafle: PLASTIC / ALU / SZKŁO. Pomyłka? Cofnij.', icon: Touchpad },
  { title: 'Raport', text: 'Na koniec dnia pobierz CSV/PDF i wyślij do księgowości/operatora.', icon: FileSpreadsheet },
];

export default function HowItWorks({
  title = 'Jak to działa (3 kroki)',
  steps = DEFAULT_STEPS,
  className,
}: HowItWorksProps) {
  return (
    <section
      id="how"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="how-title"
    >
      <header className="mb-6">
        <h2 id="how-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </header>

      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => {
          const Icon = s.icon ?? UserPlus;
          return (
            <li key={i} className="rounded-lg border border-black/10 p-5 dark:border-white/15">
              <div className="mb-3 flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-xs font-semibold dark:border-white/20">
                  {i + 1}
                </span>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{s.text}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
