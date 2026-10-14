"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./controls";
import { useT } from "@/i18n/useLang";

/**
 * Asks before doing something that can't be undone. Cancel has focus first,
 * so pressing Enter by habit is safe. Escape also cancels.
 */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      aria-labelledby={titleId}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-xl bg-fog p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="p-5 sm:p-6">
        <h2 id={titleId} className="text-2xl font-extrabold tracking-tight">
          {title}
        </h2>
        <div className="mt-2 grid gap-2 text-ink-soft">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" autoFocus onClick={() => ref.current?.close()}>
            {cancelLabel ?? t.list.clear.cancel}
          </Button>
          <Button type="button" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
