"use client";

import { useState } from "react";
import { Button, buttonClass } from "@/components/controls";
import { CheckIcon, LinkIcon, PdfIcon, PrinterIcon, SaveIcon } from "@/components/icons";
import { useStandalone } from "@/components/useStandalone";
import { useT } from "@/i18n/useLang";

/**
 * Near the end of the list, with Know your home and Keep it fresh. The list
 * lives only in this browser, and browsers can clear it (Safari after about a
 * week without a visit), so this says plainly not to rely on the site, and
 * offers two ways to keep a copy: print or PDF, which keeps everything, and the
 * link, which brings back answers and checkmarks but not Know your home or notes.
 * The note under Save / share and a one-time reminder both point here.
 */
export function SaveYourList({
  url,
  onPrint,
  onDownload,
  busy,
}: {
  url: string;
  onPrint: () => void;
  onDownload: () => void;
  busy: boolean;
}) {
  const t = useT().list.save;
  const standalone = useStandalone();
  const [status, setStatus] = useState<"" | "copied" | "failed">("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      setTimeout(() => setStatus(""), 2500);
    } catch {
      setStatus("failed");
    }
  };
  const mail = `mailto:?subject=${encodeURIComponent(t.mailSubject)}&body=${encodeURIComponent(t.mailBody(url))}`;

  return (
    <section className="no-print mt-6 scroll-mt-4 border-t border-line pt-10" aria-labelledby="keep-copy-title">
      <h2 id="keep-copy-title" tabIndex={-1} className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
        <SaveIcon />
        {t.title}
      </h2>
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
            <a href={mail} className={buttonClass.secondary}>
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
    </section>
  );
}
