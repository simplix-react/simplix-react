// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { useAccessContext } from "@simplix-react/access/react";
import { createAccessTestWrapper } from "../access-test-wrapper.js";
import { createMockPolicy } from "../mock-policy.js";

describe("createAccessTestWrapper", () => {
  it("returns a valid React wrapper component", () => {
    const wrapper = createAccessTestWrapper();
    expect(typeof wrapper).toBe("function");
  });

  it("provides QueryClient context", () => {
    const wrapper = createAccessTestWrapper();
    const { result } = renderHook(() => useQueryClient(), { wrapper });
    expect(result.current).toBeInstanceOf(QueryClient);
  });

  it("provides Access context", () => {
    const wrapper = createAccessTestWrapper();
    const { result } = renderHook(() => useAccessContext(), { wrapper });
    expect(result.current).toBeDefined();
    expect(typeof result.current.can).toBe("function");
  });

  it("defaults to full access policy", () => {
    const wrapper = createAccessTestWrapper();
    const { result } = renderHook(() => useAccessContext(), { wrapper });
    expect(result.current.can("manage", "all")).toBe(true);
  });

  it("accepts a custom policy", () => {
    const restrictedPolicy = createMockPolicy({
      rules: [{ action: "view", subject: "Pet" }],
      allowAll: false,
    });
    const wrapper = createAccessTestWrapper({ policy: restrictedPolicy });
    const { result } = renderHook(() => useAccessContext(), { wrapper });
    expect(result.current.can("view", "Pet")).toBe(true);
    expect(result.current.can("edit", "Pet")).toBe(false);
  });

  it("accepts a custom QueryClient", () => {
    const customClient = new QueryClient({
      defaultOptions: { queries: { retry: 5 } },
    });
    const wrapper = createAccessTestWrapper({ queryClient: customClient });
    const { result } = renderHook(() => useQueryClient(), { wrapper });
    expect(result.current).toBe(customClient);
  });
});
