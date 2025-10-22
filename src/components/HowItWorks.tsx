'use client';

import React from 'react';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { UserPlus, Touchpad, FileSpreadsheet } from 'lucide-react';

export type HowStep = {
  title: string;
  text: string;
  icon?: React.ComponentType<any>;
};

export type HowItWorksProps = {
  eyebrow?: string; // piccolo titolo sopra
  title?: string;   // h2
  steps?: HowStep[];
  className?: string;
};

const DEFAULT_STEPS: HowStep[] = [
  { title: 'Rejestracja', text: 'Załóż konto, dodaj sklep i kasjerów (60 sek.).', icon: UserPlus },
  { title: 'Tryb POS', text: 'Trzy kafle: PLASTIC / ALU / SZKŁO. Pomyłka? Cofnij.', icon: Touchpad },
  { title: 'Raport', text: 'Na koniec dnia pobierz CSV/PDF i wyślij do księgowości/operatora.', icon: FileSpreadsheet },
];

export default function HowItWorks({
  eyebrow = '3 proste kroki',
  title = 'Jak to działa',
  steps = DEFAULT_STEPS,
  className,
}: HowItWorksProps) {
  const prefersReduce = useReducedMotion();

  const fade = (i = 0): MotionProps => ({
    initial: { opacity: 0, y: prefersReduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.06 * i, duration: prefersReduce ? 0.35 : 0.5 },
  });

  return (
    <section
      id="how"
      className={`relative isolate ${className || ''}`}
      aria-labelledby="how-title"
    >
      {/* background flair discreto */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[12%] top-[-10%] h-[30vh] w-[30vh] rounded-full blur-3xl opacity-35
                        bg-[conic-gradient(from_90deg,theme(colors.emerald.400/.26),transparent_55%,theme(colors.amber.400/.2),transparent_75%)]
                        dark:bg-[conic-gradient(from_90deg,theme(colors.emerald.300/.22),transparent_55%,theme(colors.amber.300/.18),transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 md:py-24">
        {/* eyebrow */}
        <motion.p
          className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
          {...fade(0)}
        >
          {eyebrow}
        </motion.p>

        {/* heading */}
        <motion.h2
          id="how-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          {...fade(1)}
        >
          {title}
        </motion.h2>

        {/* steps: 1 → 3 colonne */}
        <motion.ol
          className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
          {...fade(2)}
        >
          {steps.map((s, i) => {
            const Icon = s.icon ?? UserPlus;
            return (
              <li
                key={i}
                className="rounded-xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/15 dark:bg-white/10"
              >
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
        </motion.ol>

        {/* nota opzionale */}
        <motion.p
          className="mt-6 text-xs text-gray-600 dark:text-gray-300"
          {...fade(3 + steps.length)}
        >
          Cały proces zajmuje mniej niż 10 minut — bez integracji i bez RVM.
        </motion.p>
      </div>
    </section>
  );
}
