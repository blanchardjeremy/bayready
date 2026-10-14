"use client";

import { useEffect } from "react";

/**
 * Keeps the tab title in the visitor's language. Page metadata is built once, in
 * English, so this sets it on the client. Next can write the static title back
 * after a navigation, so it watches <head> and puts the translated one back.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    // Only on this page: leaving it can write the next page's title before this effect is cleaned up.
    const path = location.pathname;
    const apply = () => {
      if (location.pathname === path && document.title !== title) document.title = title;
    };
    apply();
    const watch = new MutationObserver(apply);
    watch.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => watch.disconnect();
  }, [title]);
}
