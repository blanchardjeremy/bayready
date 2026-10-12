"use client";

import { useCallback, useSyncExternalStore } from "react";

// A tiny localStorage-backed store. Storage can throw (private mode, blocked
// site data), so every access is guarded and the app keeps working in memory.

const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    const v = window.localStorage.getItem(key);
    if (v !== null) return v;
  } catch {
    // fall through to memory
  }
  return memory.get(key) ?? null;
}

function write(key: string, value: string | null) {
  if (value === null) memory.delete(key);
  else memory.set(key, value);
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // memory copy is enough for this session
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

// Parse once per raw string so consumers get a stable object identity.
const parsed = new Map<string, { raw: string | null; value: unknown }>();
function parseCached<T>(key: string, raw: string | null, fallback: T, normalize?: (v: unknown) => T): T {
  const hit = parsed.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      const json: unknown = JSON.parse(raw);
      value = normalize ? normalize(json) : (json as T);
    } catch {
      value = fallback;
    }
  }
  parsed.set(key, { raw, value });
  return value;
}

/**
 * Persisted JSON state. Returns `undefined` during server render and the first
 * client render pass so callers can show a neutral placeholder without a
 * hydration mismatch.
 */
export function useStored<T>(
  key: string,
  fallback: T,
  /** Upgrades data saved by an older version (e.g. fills in fields added since). */
  normalize?: (v: unknown) => T,
): [T | undefined, (next: T | ((prev: T) => T)) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => undefined as unknown as string | null,
  );

  const hydrated = raw !== (undefined as unknown);
  const value: T | undefined = hydrated ? parseCached(key, raw, fallback, normalize) : undefined;

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const currentRaw = read(key);
      const prev = parseCached(key, currentRaw, fallback, normalize);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      write(key, JSON.stringify(resolved));
    },
    // fallback is expected to be a stable module-level constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, set];
}

export function clearStored(key: string) {
  write(key, null);
}
