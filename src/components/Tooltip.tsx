"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

/**
 * A small dark label that appears on hover or keyboard focus, for icon buttons.
 * Radix keeps it on screen near edges, closes it on Escape, and links it to the
 * button for screen readers. The button should still have its own aria-label.
 */
export function Tooltip({ label, children, side = "top" }: { label: string; children: ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <RadixTooltip.Provider delayDuration={150} skipDelayDuration={300}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={4}
            collisionPadding={8}
            className="no-print z-50 rounded-md bg-ink px-2.5 py-1.5 text-[0.85rem] font-semibold leading-tight text-paper shadow-[0_6px_16px_-6px_rgba(19,41,61,0.45)]"
          >
            {label}
            <RadixTooltip.Arrow className="fill-ink" width={10} height={5} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
