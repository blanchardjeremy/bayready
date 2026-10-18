"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LANGS } from "@/i18n/lang";
import { setLang, useLang, useT } from "@/i18n/useLang";

/** Keeps <html lang> in step with the chosen language, for screen readers and translation tools. */
function useHtmlLang() {
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}

export function SkipLink() {
  const t = useT();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2"
    >
      {t.common.skipToContent}
    </a>
  );
}

export function SiteHeader() {
  const t = useT();
  useHtmlLang();
  return (
    <header className="no-print">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <Mark />
          Bay Ready
        </Link>
        <nav className="flex items-center gap-5 text-[0.95rem] text-ink-soft">
          <Link href="/list" className="hover:text-ink">
            {t.common.myList}
          </Link>
          <Link href="/about" className="hover:text-ink">
            {t.common.sources}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}

/**
 * Shows the other language by its own name ("Español" on the English site),
 * so someone who can't read the current language can still find theirs.
 */
export function LanguageSwitcher() {
  const lang = useLang();
  const t = useT();
  const others = LANGS.filter((l) => l.id !== lang);
  return (
    <div role="group" aria-label={t.common.language} className="flex items-center gap-1">
      <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" />
        <path d="M1.75 8h12.5M8 1.75c1.8 1.9 2.6 4 2.6 6.25S9.8 12.35 8 14.25C6.2 12.35 5.4 10.25 5.4 8S6.2 3.65 8 1.75Z" />
      </svg>
      {others.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          onClick={() => setLang(l.id)}
          className="min-h-11 rounded px-1 font-semibold text-ink underline underline-offset-2 hover:text-ink"
        >
          {l.name}
        </button>
      ))}
    </div>
  );
}

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="no-print border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-4 py-6 text-sm text-ink-soft sm:px-6">
        <p>{t.common.footer}</p>
        <a
          href="https://github.com/blanchardjeremy/bayready"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-ink underline underline-offset-2"
        >
          {t.common.github}
        </a>
      </div>
    </footer>
  );
}

function Mark() {
  // A tag with a grommet: the same shape used for kit sections.
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
      <path d="M6 0H22V16H6L0 8Z" fill="var(--orange)" />
      <circle cx="6.5" cy="8" r="2" fill="var(--fog)" />
    </svg>
  );
}
