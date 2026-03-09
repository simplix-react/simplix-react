import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureMutator, getMutator } from "../index.js";

describe("configureMutator / getMutator", () => {
  beforeEach(() => {
    // Register a default mutator to reset state
    configureMutator(vi.fn().mockResolvedValue({}));
  });

  it("registers and retrieves a default mutator", () => {
    const fetcher = vi.fn().mockResolvedValue({ data: "ok" });
    configureMutator(fetcher);
    const mutator = getMutator();
    expect(typeof mutator).toBe("function");
  });

  it("retrieved mutator calls the registered function", async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: "ok" });
    configureMutator(fetcher);
    const mutator = getMutator();
    const result = await mutator("/api/test");
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][0]).toBe("/api/test");
    expect(result).toEqual({ data: "ok" });
  });

  it("throws when no mutator is configured for the requested strategy", () => {
    expect(() => getMutator("nonexistent")).toThrow(
      'Mutator "nonexistent" not configured. Call configureMutator() first.',
    );
  });

  it("registers a named strategy mutator", async () => {
    const adminFetcher = vi.fn().mockResolvedValue({ admin: true });
    configureMutator("admin", adminFetcher);
    const mutator = getMutator("admin");
    const result = await mutator("/api/admin");
    expect(adminFetcher).toHaveBeenCalled();
    expect(result).toEqual({ admin: true });
  });

  it("supports multiple named strategies", async () => {
    const publicFetcher = vi.fn().mockResolvedValue({ public: true });
    const adminFetcher = vi.fn().mockResolvedValue({ admin: true });
    configureMutator("public", publicFetcher);
    configureMutator("admin", adminFetcher);

    const pub = await getMutator("public")("/api/public");
    const admin = await getMutator("admin")("/api/admin");
    expect(pub).toEqual({ public: true });
    expect(admin).toEqual({ admin: true });
  });

  it("overrides an existing default mutator", async () => {
    const first = vi.fn().mockResolvedValue({ first: true });
    const second = vi.fn().mockResolvedValue({ second: true });
    configureMutator(first);
    configureMutator(second);

    const mutator = getMutator();
    const result = await mutator("/api/test");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
    expect(result).toEqual({ second: true });
  });

  it("overrides an existing named strategy mutator", async () => {
    const first = vi.fn().mockResolvedValue({ first: true });
    const second = vi.fn().mockResolvedValue({ second: true });
    configureMutator("custom", first);
    configureMutator("custom", second);

    const result = await getMutator("custom")("/api/test");
    expect(first).not.toHaveBeenCalled();
    expect(result).toEqual({ second: true });
  });

  it("default and named strategies are independent", () => {
    const defaultFetcher = vi.fn().mockResolvedValue({});
    const namedFetcher = vi.fn().mockResolvedValue({});
    configureMutator(defaultFetcher);
    configureMutator("special", namedFetcher);

    const defaultMutator = getMutator();
    const namedMutator = getMutator("special");
    expect(defaultMutator).not.toBe(namedMutator);
  });
});
