import { describe, it, expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { createTestQueryClient } from "../test-query-client.js";

describe("createTestQueryClient", () => {
  it("returns a QueryClient instance", () => {
    const client = createTestQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
  });

  it("disables query retries", () => {
    const client = createTestQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.retry).toBe(false);
  });

  it("sets gcTime to 0", () => {
    const client = createTestQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.gcTime).toBe(0);
  });

  it("sets staleTime to 0", () => {
    const client = createTestQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(0);
  });

  it("disables mutation retries", () => {
    const client = createTestQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.mutations?.retry).toBe(false);
  });

  it("returns a new instance on each call", () => {
    const a = createTestQueryClient();
    const b = createTestQueryClient();
    expect(a).not.toBe(b);
  });
});
