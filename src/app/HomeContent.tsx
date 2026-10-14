"use client";

import { StartActions } from "@/components/StartActions";
import { useDocumentTitle } from "@/components/useDocumentTitle";
import { useT } from "@/i18n/useLang";

/** The home page, in the visitor's language. */
export function HomeContent() {
  const t = useT().pages.home;
  useDocumentTitle(t.title);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-12 pb-16 pt-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div>
          <h1 className="max-w-[16ch] text-[clamp(2.3rem,7vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            {t.heading}
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg text-ink-soft">{t.intro}</p>
          <StartActions />
          <p className="mt-6 text-[0.95rem] text-ink-soft">{t.footnote}</p>
        </div>
        <ExampleList />
      </section>

      <section className="grid gap-8 border-t border-line py-12 sm:grid-cols-3" aria-label={t.howItWorks}>
        {(["here", "basics", "amounts"] as const).map((k) => (
          <div key={k}>
            <h2 className="text-lg font-extrabold tracking-tight">{t.points[k].title}</h2>
            <p className="mt-2 text-ink-soft">{t.points[k].body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

/**
 * A static peek at what the result looks like: the essentials for 2 adults and a dog.
 * Names and amounts match the real list for that household.
 */
function ExampleList() {
  const t = useT().pages.home.example;
  const rows: [keyof typeof t.rows, boolean][] = [
    ["water", true],
    ["protein", false],
    ["opener", true],
    ["light", false],
    ["bucket", false],
    ["petFood", false],
  ];
  return (
    <figure aria-label={t.label} className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="rotate-[-1.2deg] rounded-xl bg-paper p-6 shadow-[0_1px_0_var(--line),0_18px_40px_-24px_rgba(19,41,61,0.45)]">
        <span className="tag text-lg">{t.tag}</span>
        <p className="mt-3 text-[0.95rem] text-ink-soft">{t.who}</p>
        <ul className="mt-4 divide-y divide-line">
          {rows.map(([key, have]) => (
            <li key={key} className="flex items-start gap-3 py-2.5">
              <span
                aria-hidden="true"
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded border-2 ${
                  have ? "border-eucalyptus bg-eucalyptus" : "border-ink-soft"
                }`}
              >
                {have && (
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="var(--paper)" strokeWidth="2.5">
                    <path d="M3 8.5 6.5 12 13 4.5" />
                  </svg>
                )}
              </span>
              <span className={`flex-1 ${have ? "text-ink-soft line-through decoration-1" : "font-semibold"}`}>
                {t.rows[key].name}
              </span>
              <span className="whitespace-nowrap text-[0.95rem] tabular-nums text-ink-soft">{t.rows[key].qty}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.95rem] text-ink-soft">{t.more}</p>
        <p className="mt-3 text-[0.95rem] font-semibold text-eucalyptus">{t.progress}</p>
        <p className="mt-1 text-[0.95rem] text-ink-soft">{t.then}</p>
      </div>
      <figcaption className="sr-only">{t.caption}</figcaption>
    </figure>
  );
}
