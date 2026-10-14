"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { buttonClass } from "./controls";
import { useT } from "@/i18n/useLang";

export interface MenuItem {
  key: string;
  label: ReactNode;
  /** A link opens in a new tab; otherwise onSelect runs. */
  href?: string;
  onSelect?: () => void;
}

/**
 * A button that opens a small menu of choices. Arrow keys move through it,
 * Escape or a click outside closes it, and focus goes back to the button.
 */
export function MenuButton({
  label,
  icon,
  items,
  variant = "secondary",
  align = "right",
  disabled = false,
  className = "",
}: {
  label: ReactNode;
  icon?: ReactNode;
  items: MenuItem[];
  variant?: keyof typeof buttonClass;
  /** Which edge of the button the menu lines up with. Use "left" when the button sits at the left of the page. */
  align?: "left" | "right";
  disabled?: boolean;
  className?: string;
}) {
  const newTab = useT().list.calendar.newTab;
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const refs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    refs.current[0]?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = refs.current.indexOf(document.activeElement as HTMLAnchorElement | HTMLButtonElement);
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = items.length;
      refs.current[(i + (e.key === "ArrowDown" ? 1 : n - 1)) % n]?.focus();
    }
  };

  const itemClass = "block w-full px-4 py-2.5 text-left text-[0.95rem] text-ink hover:bg-fog focus:bg-fog focus:outline-none";
  return (
    <div ref={wrap} className={`relative ${className}`} onKeyDown={onKeyDown}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`${buttonClass[variant]} disabled:opacity-60`}
      >
        {icon}
        {label}
        <svg viewBox="0 0 16 16" className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className={`absolute ${align === "left" ? "left-0" : "right-0"} z-20 mt-1.5 min-w-56 overflow-hidden rounded-lg border border-line bg-paper py-1 shadow-[0_12px_32px_-12px_rgba(19,41,61,0.35)]`}
        >
          {items.map((it, i) =>
            it.href ? (
              <a
                key={it.key}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                role="menuitem"
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                {it.label}
                <span className="sr-only"> {newTab}</span>
              </a>
            ) : (
              <button
                key={it.key}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                role="menuitem"
                type="button"
                onClick={() => {
                  // Run first, in the same click: printing on Safari opens a tab, which only works during the click.
                  it.onSelect?.();
                  close();
                }}
                className={itemClass}
              >
                {it.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
