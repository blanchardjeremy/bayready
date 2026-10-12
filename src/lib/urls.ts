/**
 * A path within the site, including the GitHub Pages sub-path when there is one.
 * `Link` and `router.push` handle that on their own; this is for the few places
 * that build URLs by hand (share links, calendar files, history.replaceState).
 */
export function sitePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  // The Pages build gives every page its own folder, so its URLs end in a slash.
  return base ? `${base}${path.endsWith("/") ? path : `${path}/`}` : path;
}

export function siteUrl(path: string): string {
  return `${window.location.origin}${sitePath(path)}`;
}

/** The public site. Credits in exports always link here, wherever the app is running. */
export const BAY_READY_URL = "https://blanchardjeremy.github.io/bayready/";

/** One-line credit for things people take out of the app (copied text, calendar files). */
export const CREDIT = `Made with Bay Ready, a free emergency kit planner for the Bay Area: ${BAY_READY_URL}`;
