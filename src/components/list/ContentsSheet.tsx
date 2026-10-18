"use client";

import { useEffect, useRef, useState } from "react";
import type { MenuItem } from "@/components/MenuButton";
import { ListOutline, type OutlineSection } from "./ListOutline";
import { SaveStatus, type SaveInfo } from "./SaveStatus";
import { jumpTo } from "./useActiveSection";

const ListIcon = ({ className = "size-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
);

/**
 * The phone version of the sidebar. A "Contents" button near the top of the
 * list, plus a small round button in the corner once that one scrolls away,
 * both opening a sheet with the outline and everything in Save / share.
 * Hidden on wide screens, where the sidebar shows instead.
 */
export function ContentsSheet({
  sections,
  active,
  items,
  saved,
  onSave,
  t,
  countLabel,
}: {
  sections: OutlineSection[];
  active: string | null;
  items: MenuItem[];
  saved?: SaveInfo;
  onSave: () => void;
  t: { contents: string; openContents: string; close: string; sections: string; saveShare: string };
  countLabel: (done: number, total: number) => string;
}) {
  const inline = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const [showCorner, setShowCorner] = useState(false);

  // The corner button only appears once the in-page one has scrolled up out of view.
  useEffect(() => {
    const el = inline.current;
    if (!el) return;
    const watch = new IntersectionObserver(([e]) => setShowCorner(!e.isIntersecting && e.boundingClientRect.top < 0));
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  const open = () => sheet.current?.showModal();
  const close = () => sheet.current?.close();
  const current = sections.find((s) => s.id === active);

  return (
    <div className="no-print lg:hidden">
      <button
        ref={inline}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="mt-5 flex min-h-11 w-full items-center gap-2 rounded-lg border-2 border-ink bg-paper px-4 text-left font-semibold"
      >
        <ListIcon />
        <span className="flex-1">{t.contents}</span>
        {current?.progress && current.progress.total > 0 && (
          <span className="text-[0.88rem] font-normal tabular-nums text-ink-soft">
            {current.label} · {current.progress.done}/{current.progress.total}
          </span>
        )}
      </button>

      {showCorner && (
        <button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          aria-label={t.openContents}
          className="fixed bottom-4 right-4 z-30 grid size-14 place-items-center rounded-full bg-ink text-paper shadow-[0_10px_24px_-10px_rgba(19,41,61,0.6)]"
        >
          <ListIcon className="size-6" />
        </button>
      )}

      <dialog
        ref={sheet}
        aria-label={t.contents}
        className="m-0 mt-auto max-h-[85vh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-fog p-0 text-ink backdrop:bg-ink/40"
        onClick={(e) => {
          // A tap on the dimmed area outside the sheet closes it.
          if (e.target === sheet.current) close();
        }}
      >
        <div className="px-5 pb-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight">{t.contents}</h2>
            <button type="button" onClick={close} className="inline-flex min-h-11 items-center px-2 font-semibold underline underline-offset-2">
              {t.close}
            </button>
          </div>
          <div className="mt-2 -ml-4">
            <ListOutline
              sections={sections}
              active={active}
              label={t.sections}
              countLabel={countLabel}
              onJump={(id) => {
                close();
                requestAnimationFrame(() => jumpTo(id));
              }}
            />
          </div>
          <h2 className="mt-6 border-t border-line pt-5 text-lg font-extrabold tracking-tight">{t.saveShare}</h2>
          {saved && (
            <div className="mt-1">
              <SaveStatus
                saved={saved}
                compact
                onSave={() => {
                  close();
                  onSave();
                }}
              />
            </div>
          )}
          <div className="mt-1">
            {items.map((it) =>
              it.heading ? (
                <p key={it.key} className="pb-1 pt-3 text-[0.75rem] font-semibold uppercase tracking-wider text-ink-soft">
                  {it.label}
                </p>
              ) : (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => {
                    // Run in the same tap: printing on Safari opens a tab, which only works during the tap itself.
                    it.onSelect?.();
                    close();
                  }}
                  className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-2 text-left hover:bg-paper"
                >
                  {it.icon && <span className="text-ink-soft">{it.icon}</span>}
                  {it.label}
                </button>
              ),
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
