"use client";

import { useState } from "react";
import { Button, buttonClass } from "@/components/controls";
import { CheckIcon, LinkIcon } from "@/components/icons";
import { useStandalone } from "@/components/useStandalone";

/**
 * Shown after the first checkmark. The list lives only in this browser, and
 * Safari clears a site's saved data after about a week without a visit, so
 * this offers three ways to keep it: the link, an email to yourself, or the
 * Home Screen app (which Safari doesn't clear).
 */
export function SaveYourList({ url, onDismiss }: { url: string; onDismiss: () => void }) {
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
  const mail = `mailto:?subject=${encodeURIComponent("My emergency list")}&body=${encodeURIComponent(
    `Here's the link to my Bay Ready emergency list. Open it to bring the list back on any phone or computer:\n\n${url}\n`,
  )}`;

  return (
    <section
      className="no-print mt-8 rounded-xl border-2 border-eucalyptus bg-paper p-5 sm:p-6"
      aria-labelledby="save-list-title"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="save-list-title" className="text-xl font-extrabold tracking-tight">
          Save your list
        </h2>
        <button
          type="button"
          onClick={onDismiss}
          className="-mr-2 -mt-2 inline-flex min-h-11 items-center px-2 text-[0.95rem] text-ink-soft underline underline-offset-2 hover:text-ink"
        >
          Hide this
        </button>
      </div>
      <p className="mt-1 max-w-[64ch] text-ink-soft">
        Your list is saved in this browser only. On iPhone, Safari can clear it if you don&apos;t visit for about a
        week. Keep the link somewhere safe and you can always bring it back.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={copy}>
          {status === "copied" ? <CheckIcon /> : <LinkIcon />}
          {status === "copied" ? "Link copied" : "Copy link"}
        </Button>
        <a href={mail} className={buttonClass.secondary}>
          Email it to myself
        </a>
        <p role="status" className="text-[0.95rem] text-ink-soft">
          {status === "failed" && "Your browser didn't let us copy it. Try the email option."}
        </p>
      </div>
      {!standalone && (
        <div className="mt-5 max-w-[64ch] border-l-4 border-line pl-4">
          <h3 className="font-semibold">On iPhone: add it to your Home Screen</h3>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            In Safari, tap the Share button, then Add to Home Screen. The Home Screen app keeps your list and works
            without a connection. It starts empty, so copy your link first, then paste it in when you open the app.
          </p>
        </div>
      )}
      <p className="mt-4 max-w-[64ch] text-[0.88rem] text-ink-soft">
        The link has your answers and checkmarks, including any names and health needs, so keep it to yourself. Know
        your home info isn&apos;t in it, so print that too.
      </p>
    </section>
  );
}
