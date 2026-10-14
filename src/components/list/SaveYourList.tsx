"use client";

import { useState } from "react";
import { Button, buttonClass } from "@/components/controls";
import { CheckIcon, LinkIcon } from "@/components/icons";
import { useStandalone } from "@/components/useStandalone";
import { useT } from "@/i18n/useLang";

/**
 * Shown after the first checkmark. The list lives only in this browser, and
 * Safari clears a site's saved data after about a week without a visit, so
 * this offers three ways to keep it: the link, an email to yourself, or the
 * Home Screen app (which Safari doesn't clear).
 */
export function SaveYourList({ url, onDismiss }: { url: string; onDismiss: () => void }) {
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
    <section
      className="no-print mt-8 rounded-xl border-2 border-eucalyptus bg-paper p-5 sm:p-6"
      aria-labelledby="save-list-title"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="save-list-title" className="text-xl font-extrabold tracking-tight">
          {t.title}
        </h2>
        <button
          type="button"
          onClick={onDismiss}
          className="-mr-2 -mt-2 inline-flex min-h-11 items-center px-2 text-[0.95rem] text-ink-soft underline underline-offset-2 hover:text-ink"
        >
          {t.hide}
        </button>
      </div>
      <p className="mt-1 max-w-[64ch] text-ink-soft">{t.body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={copy}>
          {status === "copied" ? <CheckIcon /> : <LinkIcon />}
          {status === "copied" ? t.copied : t.copy}
        </Button>
        <a href={mail} className={buttonClass.secondary}>
          {t.email}
        </a>
        <p role="status" className="text-[0.95rem] text-ink-soft">
          {status === "failed" && t.failed}
        </p>
      </div>
      {!standalone && (
        <div className="mt-5 max-w-[64ch] border-l-4 border-line pl-4">
          <h3 className="font-semibold">{t.iphoneTitle}</h3>
          <p className="mt-1 text-[0.95rem] text-ink-soft">{t.iphoneBody}</p>
        </div>
      )}
      <p className="mt-4 max-w-[64ch] text-[0.88rem] text-ink-soft">{t.privacy}</p>
    </section>
  );
}
