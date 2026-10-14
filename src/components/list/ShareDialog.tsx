"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/controls";

/**
 * Opens after "Copy share link" when there's something worth knowing about
 * what the link holds: names or health needs (with a way to copy a link
 * without them), or Know your home info that it leaves out. Also shows the
 * link if copying failed.
 */
export function ShareDialog({
  url,
  privateUrl,
  copied,
  personal,
  leftOut,
  onClose,
}: {
  url: string;
  /** The same list without names or health needs. */
  privateUrl: string;
  copied: boolean;
  /** Whether the full link carries names or health needs. */
  personal: boolean;
  /** Whether there's Know your home info or notes the link leaves out. */
  leftOut: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [which, setWhich] = useState<"full" | "private">("full");
  const [copiedNow, setCopiedNow] = useState(copied);
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const shown = which === "private" ? privateUrl : url;
  const copyPrivate = () => {
    setWhich("private");
    navigator.clipboard.writeText(privateUrl).then(
      () => setCopiedNow(true),
      () => setCopiedNow(false),
    );
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="share-title"
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-xl bg-fog p-0 text-ink backdrop:bg-ink/40"
    >
      <form method="dialog" className="p-5 sm:p-6">
        <h2 id="share-title" className="text-2xl font-extrabold tracking-tight" aria-live="polite">
          {!copiedNow ? "Copy this link" : which === "private" ? "Copied, without names or health info" : "Link copied"}
        </h2>
        <p className="mt-2 text-ink-soft">
          {!copiedNow && "Your browser didn't let us copy it, so copy it from here. "}
          {which === "private"
            ? "Anyone with this link can see the list and what's checked off. Names and health needs aren't in it."
            : personal
              ? "Anyone with the link can see this list and what's checked off, including the names and health needs you entered."
              : "Anyone with the link can see this list and what's checked off."}
        </p>
        <input
          readOnly
          value={shown}
          aria-label="Share link"
          onFocus={(e) => e.currentTarget.select()}
          className="mt-3 min-h-11 w-full rounded-md border border-field-line bg-paper px-3 text-[0.9rem] text-ink-soft"
        />
        {leftOut && (
          <p className="mt-3 text-[0.95rem] text-ink-soft">
            Know your home info and notes stay on this device. To share them, print them or download the PDF or
            spreadsheet.
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          {personal && which === "full" && (
            <Button type="button" variant="secondary" onClick={copyPrivate}>
              Copy without names or health info
            </Button>
          )}
          <Button type="submit" autoFocus>
            Done
          </Button>
        </div>
      </form>
    </dialog>
  );
}
