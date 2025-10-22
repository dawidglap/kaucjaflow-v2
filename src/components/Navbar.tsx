'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export type NavbarProps = {
  logoSrc?: string;
  logoAlt?: string;
  className?: string;
};

const NAV_ITEMS = [
  { href: '#features', label: 'Funkcje' },
  { href: '#pricing', label: 'Cennik' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Kontakt' },
];

export default function Navbar({
  logoSrc = '/images/logo.png',
  logoAlt = 'KaucjaFlow',
  className,
}: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-black/5 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-black/40 ${className || ''}`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2">
          {/* Sostituisci width/height in base al tuo asset */}
          <Image src={logoSrc} alt={logoAlt} width={120} height={28} priority />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}

          <div className="ml-2 flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-black hover:text-white dark:border-white/20 dark:hover:bg-white dark:hover:text-black"
            >
              Zaloguj się
            </Link>
            {/* <Link
              href="/login"
              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:bg-white dark:text-black"
            >
              Załóż konto
            </Link> */}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Otwórz menu"
          className="inline-flex items-center md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="border-t border-black/5 bg-white/95 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-black/80 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-base text-gray-800 transition-colors hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-md border border-black/10 px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-black hover:text-white dark:border-white/20 dark:hover:bg-white dark:hover:text-black"
              >
                Zaloguj się
              </Link>
              {/* <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-md bg-black px-3 py-2 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
              >
                Załóż konto
              </Link> */}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
