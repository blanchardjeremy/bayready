import type { Metadata } from "next";

export const metadata: Metadata = { title: "OK / HELP window sign – Bay Ready" };

// The same message in San Francisco's five most-used languages (see research/ux.md).
const SIDES = [
  {
    word: "OK",
    color: "bg-[#2f6b4f]",
    en: "We're OK. No help needed.",
    more: ["Estamos bien", "我們平安", "Ligtas kami", "Chúng tôi an toàn"],
  },
  {
    word: "HELP",
    color: "bg-[#b0381c]",
    en: "We need help.",
    more: ["Necesitamos ayuda", "我們需要幫助", "Kailangan namin ng tulong", "Chúng tôi cần giúp đỡ"],
  },
];

export default function SignPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6 print:max-w-none print:p-0">
      <div className="no-print">
        <h1 className="text-[2.2rem] font-extrabold leading-tight tracking-[-0.025em]">OK / HELP window sign</h1>
        <div className="mt-3 max-w-[64ch] space-y-3 text-lg text-ink-soft">
          <p>
            After a big earthquake, neighbors and crews go door to door. A sign in a window facing the street tells
            them who needs help first, so they can skip homes that are fine.
          </p>
          <p>
            Print this page, cut or fold it in half, and keep it by your front door with some tape. Put up HELP even
            if you can&apos;t get to the door.
          </p>
        </div>
        <p className="mt-4 text-[0.95rem] text-ink-soft">It prints on one page. Nothing to fill in.</p>
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
            <p className="text-[7rem] font-extrabold leading-none tracking-tight sm:text-[9rem]">{s.word}</p>
            <p className="mt-3 text-2xl font-semibold">{s.en}</p>
            <p className="mt-2 text-lg opacity-90">{s.more.join(" · ")}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
