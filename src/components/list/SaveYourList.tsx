"use client";

import { useEffect, useRef, useState } from "react";
import { Button, buttonClass } from "@/components/controls";
import { CheckIcon, LinkIcon, PdfIcon, PrinterIcon, SaveIcon } from "@/components/icons";
import { useStandalone } from "@/components/useStandalone";
import { useT } from "@/i18n/useLang";

interface SaveProps {
  url: string;
  onPrint: () => void;
  onDownload: () => void;
  /** They copied or emailed the link. */
  onSaved: () => void;
  busy: boolean;
}

/**
 * Near the end of the list, with Know your home and Keep it fresh. The list
 * lives only in this browser, and browsers can clear it (Safari after about a
 * week without a visit), so this says plainly not to rely on the site, and
 * offers two ways to keep a copy: print or PDF, which keeps everything, and the
 * link, which brings back answers and checkmarks but not Know your home or notes.
 */
export function SaveYourList(props: SaveProps) {
  const t = useT().list.save;
  return (
    <section className="no-print mt-6 scroll-mt-4 border-t border-line pt-10" aria-labelledby="keep-copy-title">
      <h2 id="keep-copy-title" tabIndex={-1} className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
        <SaveIcon />
        {t.title}
      </h2>
      <SaveOptions {...props} />
    </section>
  );
}

/** The same choices in a dialog, opened from "Save a copy" near the top and by Save / share. */
export function SaveDialog({ onClose, ...props }: SaveProps & { onClose: () => void }) {
  const t = useT().list.save;
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="save-dialog-title"
      className="no-print m-auto max-h-[calc(100dvh-2rem)] w-[min(44rem,calc(100vw-2rem))] overflow-y-auto rounded-xl bg-fog p-0 text-ink backdrop:bg-ink/40"
      onClick={(e) => {
        // A click on the dimmed area outside closes it.
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="save-dialog-title" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            <SaveIcon />
            {t.title}
          </h2>
          <form method="dialog">
            <button type="submit" className="inline-flex min-h-11 items-center px-2 font-semibold underline underline-offset-2">
              {t.close}
            </button>
          </form>
        </div>
        <SaveOptions {...props} />
      </div>
    </dialog>
  );
}

/** What it says and the buttons: print or PDF, copy or email the link, and the Home Screen tip. */
function SaveOptions({ url, onPrint, onDownload, onSaved, busy }: SaveProps) {
  const t = useT().list.save;
  const standalone = useStandalone();
  const [status, setStatus] = useState<"" | "copied" | "failed">("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      onSaved();
      setTimeout(() => setStatus(""), 2500);
    } catch {
      setStatus("failed");
    }
  };
  const mail = `mailto:?subject=${encodeURIComponent(t.mailSubject)}&body=${encodeURIComponent(t.mailBody(url))}`;

  return (
    <>
      <p className="mt-2 max-w-[64ch] text-ink-soft">{t.body}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-paper-2 p-4">
          <h3 className="font-semibold">{t.printTitle}</h3>
          <p className="mt-1 text-[0.95rem] text-ink-soft">{t.printBody}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={busy} onClick={onPrint}>
              <PrinterIcon />
              {t.print}
            </Button>
            <Button type="button" variant="secondary" disabled={busy} onClick={onDownload}>
              <PdfIcon />
              {t.pdf}
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-paper-2 p-4">
          <h3 className="font-semibold">{t.linkTitle}</h3>
          <p className="mt-1 text-[0.95rem] text-ink-soft">{t.linkBody}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={copy}>
              {status === "copied" ? <CheckIcon /> : <LinkIcon />}
              {status === "copied" ? t.copied : t.copy}
            </Button>
            <a href={mail} onClick={onSaved} className={buttonClass.secondary}>
              {t.email}
            </a>
          </div>
          <p role="status" className="mt-2 text-[0.95rem] text-ink-soft empty:hidden">
            {status === "failed" && t.failed}
          </p>
          <p className="mt-2 text-[0.88rem] text-ink-soft">{t.privacy}</p>
        </div>
      </div>

      {!standalone && (
        <div className="mt-5 max-w-[64ch] border-l-4 border-line pl-4">
          <h3 className="font-semibold">{t.iphoneTitle}</h3>
          <p className="mt-1 text-[0.95rem] text-ink-soft">{t.iphoneBody}</p>
        </div>
      )}
    </>
  );
}
