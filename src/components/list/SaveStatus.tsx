"use client";

import { useLang, useT } from "@/i18n/useLang";

/** When they last kept a copy, if ever, and how many changes since. */
export interface SaveInfo {
  savedAt: string | null;
  changes: number;
}

/**
 * One line about keeping a copy: "Saved in this browser only", "You saved a
 * copy on Oct 14", or "3 changes since your copy on Oct 14", with a link to
 * save (again). Shown near the top of the list and by Save / share.
 */
export function SaveStatus({
  saved,
  onSave,
  compact = false,
}: {
  saved: SaveInfo;
  /** Goes to the ways to save. */
  onSave: () => void;
  compact?: boolean;
}) {
  const lang = useLang();
  const t = useT().list.savedStatus;
  const { savedAt, changes } = saved;
  const date = savedAt
    ? new Date(savedAt).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "short", day: "numeric" })
    : "";
  const fresh = !!savedAt && changes === 0;
  const text = !savedAt ? t.notYet : changes > 0 ? t.changed(changes, date) : t.saved(date);
  const action = !savedAt ? t.action : changes > 0 ? t.again : null;

  return (
    <p className={`no-print flex items-start gap-1.5 ${compact ? "text-[0.82rem] leading-snug" : "text-[0.92rem]"} text-ink-soft`}>
      {fresh ? (
        <svg viewBox="0 0 16 16" className="mt-[0.1em] size-4 shrink-0 text-eucalyptus" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
          <path d="M3 8.5 6.5 12 13 4.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="mt-[0.1em] size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="4.25" y="1.75" width="7.5" height="12.5" rx="1.5" />
          <path d="M7 11.75h2" strokeLinecap="round" />
        </svg>
      )}
      <span>
        {text}
        {action && (
          <>
            {" "}
            <button type="button" onClick={onSave} className="whitespace-nowrap font-semibold text-ink underline underline-offset-2">
              {action}
            </button>
          </>
        )}
      </span>
    </p>
  );
}
