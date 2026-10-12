import { StartActions } from "@/components/StartActions";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-12 pb-16 pt-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div>
          <h1 className="max-w-[16ch] text-[clamp(2.3rem,7vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Build your Bay Area emergency kit list
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg text-ink-soft">
            Answer 8 quick questions and get a list sized for your household, for a bin at home, a bag by the door,
            or both. It starts with what you already have.
          </p>
          <StartActions />
          <p className="mt-6 text-[0.95rem] text-ink-soft">About 3 minutes. No sign-up. Your answers stay on this device.</p>
        </div>
        <ExampleList />
      </section>

      <section className="grid gap-8 border-t border-line py-12 sm:grid-cols-3" aria-label="How it works">
        <Point title="Made for here">
          Earthquakes, smoke, planned power shutoffs, heat, storms. Pick the ones that matter where you live.
        </Point>
        <Point title="Basics first">
          Start with the essentials and a week of water and food, as Bay Area agencies recommend. Level up to two
          weeks and extra gear when you&apos;re ready.
        </Point>
        <Point title="Real amounts">
          Water, food, and pet supplies worked out for your household, with rough costs and free steps at the top.
        </Point>
      </section>
    </div>
  );
}

function Point({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
      <p className="mt-2 text-ink-soft">{children}</p>
    </div>
  );
}

/** A static peek at what the result looks like, for a household of 2 + 1 dog. */
function ExampleList() {
  const rows: [string, string, boolean][] = [
    ["Water", "18 gallons", true],
    ["Food you don't have to cook", "7 days for 2", false],
    ["Flashlight or headlamp", "2 lights", true],
    ["N95 masks", "10 masks", false],
    ["Pet food and water", "7 days for 1 pet", false],
  ];
  return (
    <figure aria-label="Example of a finished list" className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="rotate-[-1.2deg] rounded-xl bg-paper p-6 shadow-[0_1px_0_var(--line),0_18px_40px_-24px_rgba(19,41,61,0.45)]">
        <span className="tag text-lg">Stay-at-home bin</span>
        <p className="mt-3 text-[0.95rem] text-ink-soft">2 adults, 1 dog. Earthquake, outage, smoke.</p>
        <ul className="mt-4 divide-y divide-line">
          {rows.map(([name, qty, have]) => (
            <li key={name} className="flex items-center gap-3 py-2.5">
              <span
                aria-hidden="true"
                className={`grid size-5 shrink-0 place-items-center rounded border-2 ${
                  have ? "border-eucalyptus bg-eucalyptus" : "border-ink-soft"
                }`}
              >
                {have && (
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="var(--paper)" strokeWidth="2.5">
                    <path d="M3 8.5 6.5 12 13 4.5" />
                  </svg>
                )}
              </span>
              <span className={`flex-1 ${have ? "text-ink-soft line-through decoration-1" : "font-semibold"}`}>{name}</span>
              <span className="text-[0.95rem] tabular-nums text-ink-soft">{qty}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.95rem] font-semibold text-eucalyptus">2 of 5 ready</p>
      </div>
      <figcaption className="sr-only">An example list showing items, amounts, and what you already have.</figcaption>
    </figure>
  );
}
