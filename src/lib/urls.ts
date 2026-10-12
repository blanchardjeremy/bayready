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
