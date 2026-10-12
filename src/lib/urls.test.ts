import { afterEach, describe, expect, it, vi } from "vitest";
import { sitePath } from "./urls";

describe("sitePath", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("leaves paths alone when the site is served from the root", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    expect(sitePath("/list")).toBe("/list");
  });

  it("adds the GitHub Pages sub-path and a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/bay-emergency-prep");
    expect(sitePath("/list")).toBe("/bay-emergency-prep/list/");
    expect(sitePath("/list/")).toBe("/bay-emergency-prep/list/");
  });
});
