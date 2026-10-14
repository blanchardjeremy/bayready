"use client";

import { useDocumentTitle } from "@/components/useDocumentTitle";
import { useLang, useT } from "@/i18n/useLang";

// The same message in San Francisco's five most-used languages (see research/ux.md).
// The visitor's language gets the full sentence under the big word; the others follow, short.
const SIDES = [
  {
    word: "OK",
    key: "ok",
    color: "bg-[#2f6b4f]",
    short: [
      { lang: "en", text: "We're OK" },
      { lang: "es", text: "Estamos bien" },
      { lang: "zh-Hant", text: "我們平安" },
      { lang: "fil", text: "Ligtas kami" },
      { lang: "vi", text: "Chúng tôi an toàn" },
    ],
  },
  {
    word: "HELP",
    key: "help",
    color: "bg-[#b0381c]",
    short: [
      { lang: "en", text: "We need help" },
      { lang: "es", text: "Necesitamos ayuda" },
      { lang: "zh-Hant", text: "我們需要幫助" },
      { lang: "fil", text: "Kailangan namin ng tulong" },
      { lang: "vi", text: "Chúng tôi cần giúp đỡ" },
    ],
  },
] as const;

/** The OK / HELP sign page, in the visitor's language. */
export function SignContent() {
  const lang = useLang();
  const t = useT().pages.sign;
  useDocumentTitle(t.title);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6 print:max-w-none print:p-0">
      <div className="no-print">
        <h1 className="text-[2.2rem] font-extrabold leading-tight tracking-[-0.025em]">{t.heading}</h1>
        <div className="mt-3 max-w-[64ch] space-y-3 text-lg text-ink-soft">
          {t.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="mt-4 text-[0.95rem] text-ink-soft">{t.printNote}</p>
      </div>
      <div className="mt-8 grid border-2 border-dashed border-ink print:mt-0 print:h-[100vh] print:border-0">
        {SIDES.map((s, i) => (
          <section
            key={s.word}
            className={`${s.color} flex flex-col items-center justify-center px-6 py-10 text-center text-white print:h-[50vh] ${
              i ? "border-t-2 border-dashed border-white" : ""
            }`}
            style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
          >
            <p lang="en" className="text-[7rem] font-extrabold leading-none tracking-tight sm:text-[9rem]">
              {s.word}
            </p>
            <p className="mt-3 text-2xl font-semibold">{t[s.key]}</p>
            <p className="mt-2 text-lg opacity-90">
              {s.short
                .filter((m) => m.lang !== lang)
                .map((m, j) => (
                  <span key={m.lang} lang={m.lang}>
                    {j > 0 && " · "}
                    {m.text}
                  </span>
                ))}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
