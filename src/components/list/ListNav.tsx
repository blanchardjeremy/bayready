"use client";

import { MenuButton, type MenuItem } from "@/components/MenuButton";
import { ShareIcon } from "@/components/icons";
import { ContentsSheet } from "./ContentsSheet";
import { ListOutline, type OutlineSection } from "./ListOutline";
import { jumpTo, useActiveSection } from "./useActiveSection";

interface NavProps {
  sections: OutlineSection[];
  items: MenuItem[];
  busy: boolean;
  t: {
    contents: string;
    openContents: string;
    close: string;
    sections: string;
    saveShare: string;
    working: string;
    keepNote: string;
    howSaving: string;
    countLabel: (done: number, total: number) => string;
  };
}

/** Only the sections whose heading is on the page right now, like kits in the by-kit view. */
function useNav(sections: OutlineSection[]) {
  const { active, present } = useActiveSection(sections.map((s) => s.id));
  return { active, shown: sections.filter((s) => present.includes(s.id)) };
}

/** Wide screens: Save / share and the outline, in a column that stays put while the list scrolls. */
export function ListSidebar({ sections, items, busy, t }: NavProps) {
  const { active, shown } = useNav(sections);
  return (
    <aside className="no-print hidden lg:block">
      {/* The button sits outside the scrolling part, so its menu can open over the page instead of being cut off. */}
      <div className="sticky top-6 z-30 pl-3 pr-1 pt-1">
        <MenuButton
          label={busy ? t.working : t.saveShare}
          icon={<ShareIcon />}
          align="left"
          disabled={busy}
          items={items}
          className="-ml-3"
          buttonClassName="w-full justify-start"
        />
        <p className="mt-2 text-[0.82rem] leading-snug text-ink-soft">
          {t.keepNote}{" "}
          <button type="button" onClick={() => jumpTo("keep-copy-title")} className="font-semibold text-ink underline underline-offset-2">
            {t.howSaving}
          </button>
        </p>
        <p className="mt-6 text-[0.75rem] font-semibold uppercase tracking-wider text-ink-soft">{t.contents}</p>
        <div className="-ml-3 mt-1 max-h-[calc(100vh-16rem)] overflow-y-auto pb-4 pl-3">
          <ListOutline sections={shown} active={active} label={t.sections} countLabel={t.countLabel} onJump={jumpTo} />
        </div>
      </div>
    </aside>
  );
}

/** Phones: the Contents button and sheet. */
export function ListContents({ sections, items, t }: NavProps) {
  const { active, shown } = useNav(sections);
  return <ContentsSheet sections={shown} active={active} items={items} t={t} countLabel={t.countLabel} />;
}
