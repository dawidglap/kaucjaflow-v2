'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export type LegalFooterProps = {
  /** Testo legale mostrato in basso. Puoi passarlo per override. */
  text?: string;
  /** Percorsi logo per light/dark mode (facoltativi). */
  logoLightSrc?: string;
  logoDarkSrc?: string;
  className?: string;
};

const LINKS = [
  { href: '#features', label: 'Funkcje' },
  { href: '#contrast', label: 'Porównanie' },
  { href: '#how', label: 'Jak działa' },
  { href: '#social', label: 'Opinie' },
  { href: '#pricing', label: 'Cennik' },
  { href: '#faq', label: 'FAQ' },
  { href: '#cta', label: 'Start' },
];

const DEFAULT_TEXT =
  'Zakres i stawki: PET/puszka 0,50 zł; szkło wielokrotne 1,00 zł. Start 1.10.2025; okres przejściowy do 31.12.2025. ' +
  'Brak jednej „państwowej apki” — działają operatorzy z zezwoleniami. KaucjaFlow wspiera proces kasowy i raporty sklepu.';

export default function LegalFooter({
  text = DEFAULT_TEXT,
  logoLightSrc = '/images/logo-light.png',
  logoDarkSrc = '/images/logo-dark.png',
  className,
}: LegalFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={[
        'w-full border-t border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70',
        'dark:border-white/10 dark:bg-black/60 dark:supports-[backdrop-filter]:bg-black/50',
        className || '',
      ].join(' ')}
      aria-label="Stopka serwisu"
    >
      {/* Top */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-12">
        {/* Brand + short copy */}
        <div className="md:col-span-5 lg:col-span-4">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="KaucjaFlow — Strona główna">
            <span className="relative block h-7 w-[160px]">
              {/* Light mode */}
              <Image
                src={logoLightSrc}
                alt="KaucjaFlow"
                fill
                sizes="160px"
                className="block object-contain dark:hidden"
                priority
              />
              {/* Dark mode */}
              <Image
                src={logoDarkSrc}
                alt="KaucjaFlow"
                fill
                sizes="160px"
                className="hidden object-contain dark:block"
                priority
              />
            </span>
          </Link>
          <p className="mt-4 max-w-prose text-sm text-gray-700 dark:text-gray-300">
            Szybkie i proste rozliczanie kaucji w małych sklepach. Bez POS-ów, bez papierów, bez stresu.
          </p>
        </div>

        {/* Navigation columns */}
        <nav className="md:col-span-7 lg:col-span-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                Nawigacja
              </h3>
              <ul className="space-y-1">
                {LINKS.slice(0, 4).map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-gray-800 transition-colors hover:text-black dark:text-gray-200 dark:hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                Oferta
              </h3>
              <ul className="space-y-1">
                {LINKS.slice(4).map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-gray-800 transition-colors hover:text-black dark:text-gray-200 dark:hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                Konto
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-gray-800 transition-colors hover:text-black dark:text-gray-200 dark:hover:text-white"
                  >
                    Zaloguj się
                  </Link>
                </li>
                <li>
                  <a
                    href="/register"
                    className="text-sm text-gray-800 transition-colors hover:text-black dark:text-gray-200 dark:hover:text-white"
                  >
                    Załóż konto
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                Kontakt
              </h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="mailto:support@kaucjaflow.pl"
                    className="text-sm text-gray-800 transition-colors hover:text-black dark:text-gray-200 dark:hover:text-white"
                  >
                    support@kaucjaflow.pl
                  </a>
                </li>
                <li>
               
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>

      {/* Legal strip */}
      <div className="border-t border-black/10 bg-white/70 dark:border-white/10 dark:bg-black/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-700 dark:text-gray-300">{text}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            © {year} KaucjaFlow. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
