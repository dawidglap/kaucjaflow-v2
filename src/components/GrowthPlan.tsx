'use client';

import React from 'react';
import { Target, Rocket, Megaphone, Link as LinkIcon, BarChart3, Users } from 'lucide-react';

export type GrowthPlanProps = {
  title?: string;
  items?: string[];
  className?: string;
};

const DEFAULT_ITEMS: string[] = [
  'Domination Channel: cold outreach do 30k mikro-sklepów + PDF „Jak ogarnąć kaucje w 24 h”.',
  'High-Intent Capture: LP x16 (województwa) + Ads na frazy „system kaucyjny sklep jak wdrożyć”.',
  'Referrals & Partnerships: hurtownie, dystrybutorzy, franczyzy (QR w kartonie).',
  'Activation & Stickiness: onboarding wideo, przypominajki SMS/WhatsApp, NPS + polecenia.',
  'Metrics co tydzień: Lead→Sign-up ≥ 10%, Sign-up→Aktywacja ≥ 60%, retencja 30d ≥ 80%.',
];

const ICONS = [Rocket, Megaphone, LinkIcon, Users, BarChart3];

export default function GrowthPlan({
  title = 'Plan na 10 000 partnerów do stycznia 2026',
  items = DEFAULT_ITEMS,
  className,
}: GrowthPlanProps) {
  return (
    <section
      id="growth"
      className={`mx-auto w-full max-w-6xl px-4 py-14 sm:py-20 ${className || ''}`}
      aria-labelledby="growth-title"
    >
      <header className="mb-6">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
          <Target className="h-4 w-4" />
          Cel wzrostu
        </p>
        <h2
          id="growth-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {title}
        </h2>
      </header>

      <ol className="grid gap-4 sm:grid-cols-2">
        {items.map((text, i) => {
          const Icon = ICONS[i % ICONS.length] || Rocket;
          return (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 text-xs font-semibold dark:border-white/20">
                {i + 1}
              </span>
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm text-gray-900 dark:text-gray-100">{text}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
