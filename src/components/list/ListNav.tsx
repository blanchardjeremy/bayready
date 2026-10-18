"use client";

import { MenuButton, type MenuItem } from "@/components/MenuButton";
import { ShareIcon } from "@/components/icons";
import { ContentsSheet } from "./ContentsSheet";
import { ListOutline, type OutlineSection } from "./ListOutline";
import { SaveStatus, type SaveInfo } from "./SaveStatus";
import { jumpTo, useActiveSection } from "./useActiveSection";

interface NavProps {
  sections: OutlineSection[];
  items: MenuItem[];
  busy: boolean;
  /** Whether they've kept a copy. Missing on someone else's list. */
  saved?: SaveInfo;
  /** Opens the ways to save a copy. */
  onSave: () => void;
  t: {
    contents: string;
    openContents: string;
    close: string;
    sections: string;
    saveShare: string;
    working: string;
    countLabel: (done: number, total: number) => string;
  };
}

/** Only the sections whose heading is on the page right now, like kits in the by-kit view. */
function useNav(sections: OutlineSection[]) {
  const { active, present } = useActiveSection(sections.map((s) => s.id));
  return { active, shown: sections.filter((s) => present.includes(s.id)) };
}

/** Wide screens: Save / share and the outline, in a column that stays put while the list scrolls. */
export function ListSidebar({ sections, items, busy, saved, onSave, t }: NavProps) {
  const { active, shown } = useNav(sections);
  return (
    <aside className="no-print hidden lg:block">
      {/* The button sits outside the scrolling part, so its menu can open over the page instead of being cut off. */}
      {/* One text edge for everything: 16px in from the button and the outline rows. */}
      <div className="sticky top-6 z-30 pt-1">
        <MenuButton
          label={busy ? t.working : t.saveShare}
          icon={<ShareIcon />}
          align="left"
          disabled={busy}
          items={items}
          buttonClassName="w-full justify-start pl-3.5"
        />
        {saved && (
          <div className="mt-3 pl-4 pr-1">
            <SaveStatus saved={saved} compact onSave={onSave} />
          </div>
        )}
        <p className="mt-8 pl-4 text-[0.75rem] font-semibold uppercase tracking-wider text-ink-soft">{t.contents}</p>
        <div className="mt-2 max-h-[calc(100vh-17rem)] overflow-y-auto pb-4">
          <ListOutline sections={shown} active={active} label={t.sections} countLabel={t.countLabel} onJump={jumpTo} />
        </div>
      </div>
    </aside>
  );
}

/** Phones: the Contents button and sheet. */
export function ListContents({ sections, items, saved, onSave, t }: NavProps) {
  const { active, shown } = useNav(sections);
  return <ContentsSheet sections={shown} active={active} items={items} saved={saved} onSave={onSave} t={t} countLabel={t.countLabel} />;
}
