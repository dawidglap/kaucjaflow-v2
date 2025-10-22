'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export type NavbarProps = {
  logoSrc?: string;
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

export default function Navbar({ logoSrc = '/images/logo.png', className }: NavbarProps) {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    // close on route/hash change
    const onHash = () => setOpen(false);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-50 w-full',
        'backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:supports-[backdrop-filter]:bg-black/40',
        'border-b border-transparent',
        scrolled ? 'border-black/10 shadow-sm dark:border-white/10' : '',
        className || '',
      ].join(' ')}
      data-scrolled={scrolled ? 'true' : 'false'}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:h-16">
        {/* logo */}
       {/* logo (swap automatico con dark mode) */}
<Link href="/" className="inline-flex items-center gap-3" aria-label="KaucjaFlow — Strona główna">
  <span className="relative block h-6 w-[132px]">
    {/* Light mode */}
    <Image
      src="/images/logo-light.png"
      alt="KaucjaFlow"
      fill
      sizes="132px"
      className="object-contain block dark:hidden"
      priority
    />
    {/* Dark mode */}
    <Image
      src="/images/logo-dark.png"
      alt="KaucjaFlow"
      fill
      sizes="132px"
      className="object-contain hidden dark:block"
      priority
    />
  </span>
</Link>


        {/* desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-gray-800 transition-colors hover:text-black dark:text-gray-200 dark:hover:text-white"
            >
              {l.label}
            </a>
          ))}

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
            >
              Zaloguj się
            </Link>
        </nav>

        {/* mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* mobile nav drawer */}
      <div
        id="mobile-nav"
        className={[
          'md:hidden transition-[max-height,opacity] duration-200 ease-out overflow-hidden',
          open ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <nav className="mx-auto grid w-full max-w-6xl gap-1 px-4 pb-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/10"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-1 inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
          >
            Zaloguj się
          </Link>
        </nav>
      </div>
    </header>
  );
}
