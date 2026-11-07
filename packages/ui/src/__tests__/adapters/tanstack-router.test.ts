// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createTanstackRouterAdapter, flatSearch, type TanstackRouterLike } from "../../adapters/tanstack-router";
import { validateCrudSearch } from "../../crud/patterns/crud-search";

/** A router that moves on navigate and tells its subscribers, the way TanStack Router's events do. */
function fakeRouter(pathname = "/users", searchStr = "?page=2") {
  const listeners = new Map<string, Set<() => void>>();
  const router = {
    state: { location: { pathname, searchStr } },
    navigate: vi.fn(async (options: { to: string; search?: Record<string, string>; replace?: boolean }) => {
      router.state = { location: { pathname: options.to, searchStr: options.search ? flatSearch.stringifySearch(options.search) : "" } };
      for (const event of ["onBeforeLoad", "onLoad", "onResolved"]) for (const fn of listeners.get(event) ?? []) fn();
    }),
    subscribe: vi.fn((event: string, fn: () => void) => {
      const set = listeners.get(event) ?? new Set();
      set.add(fn);
      listeners.set(event, set);
      return () => set.delete(fn);
    }),
  };
  return { router: router as typeof router & TanstackRouterLike, listeners };
}

describe("flatSearch", () => {
  it("writes plain strings and leaves out empty, null and undefined values", () => {
    expect(flatSearch.stringifySearch({ "status.in": "ACTIVE,PAUSED", page: 2, q: "", a: null, b: undefined })).toBe("?status.in=ACTIVE%2CPAUSED&page=2");
    expect(flatSearch.stringifySearch({})).toBe("");
  });

  it("reads back what it wrote as strings, with no JSON quoting", () => {
    const search = { "status.in": "ACTIVE,PAUSED", page: "2", name: "Kim \"J\"" };
    expect(flatSearch.parseSearch(flatSearch.stringifySearch(search))).toEqual(search);
    expect(flatSearch.parseSearch("?status=%22ACTIVE%22")).toEqual({ status: "\"ACTIVE\"" });
  });
});

describe("createTanstackRouterAdapter", () => {
  it("navigates, replacing when asked", () => {
    const { router } = fakeRouter();
    createTanstackRouterAdapter(router).navigate("/billing", { replace: true });
    expect(router.navigate).toHaveBeenCalledWith({ to: "/billing", replace: true });
  });

  it("reads and writes the search on the current path", () => {
    const { router } = fakeRouter("/users", "?page=2&q=kim");
    const adapter = createTanstackRouterAdapter(router);
    expect(adapter.getSearchParams().get("q")).toBe("kim");
    adapter.setSearchParams(new URLSearchParams("page=3"), { replace: true });
    expect(router.navigate).toHaveBeenCalledWith({ to: "/users", search: { page: "3" }, replace: true });
  });

  it("follows the current path as the router moves, and lets go of the router when unmounted", async () => {
    const { router, listeners } = fakeRouter("/users");
    const adapter = createTanstackRouterAdapter(router);
    const { result, unmount } = renderHook(() => adapter.useCurrentPath());
    expect(result.current).toBe("/users");

    await act(async () => {
      await router.navigate({ to: "/billing/plans" });
    });
    expect(result.current).toBe("/billing/plans");

    unmount();
    expect([...listeners.values()].every((set) => set.size === 0)).toBe(true);
  });
});

describe("flatSearch carries the list filters", () => {
  it("writes each filter as its own bracketed parameter and repeats an array once per member", () => {
    const text = flatSearch.stringifySearch({
      tab: "log",
      filters: { "status.in": ["FAILED", "PAUSED"], "kind.equals": "A" },
    });
    const params = new URLSearchParams(text);
    expect(params.get("tab")).toBe("log");
    expect(params.getAll("filters[status.in]")).toEqual(["FAILED", "PAUSED"]);
    expect(params.get("filters[kind.equals]")).toBe("A");
    expect(text).not.toContain("object");
  });

  it("reads them back into an object, a lone value as a string", () => {
    const text = flatSearch.stringifySearch({ id: "7", filters: { "status.in": ["FAILED", "PAUSED"], "kind.equals": "A" } });
    expect(flatSearch.parseSearch(text)).toEqual({
      id: "7",
      filters: { "status.in": ["FAILED", "PAUSED"], "kind.equals": "A" },
    });
  });

  it("round-trips through validateCrudSearch, a one-element set reading back as its one string", () => {
    const text = flatSearch.stringifySearch({ filters: { "status.in": ["FAILED"], "commas.contains": "a,b" } });
    expect(validateCrudSearch(flatSearch.parseSearch(text)).filters).toEqual({
      "status.in": "FAILED",
      "commas.contains": "a,b",
    });
  });

  it("leaves out empty filters, an empty object and values an address cannot carry", () => {
    expect(flatSearch.stringifySearch({ filters: {} })).toBe("");
    expect(flatSearch.stringifySearch({ filters: undefined, tab: "x" })).toBe("?tab=x");
    expect(flatSearch.stringifySearch({ filters: { "a.equals": "", "b.in": [], "c.equals": { x: 1 }, "d.equals": 5 } })).toBe(
      "?filters%5Bd.equals%5D=5",
    );
  });

  it("does not mistake a plain key for a filter", () => {
    expect(flatSearch.parseSearch("?filters=abc&filter[x]=1")).toEqual({ filters: "abc", "filter[x]": "1" });
    expect(validateCrudSearch(flatSearch.parseSearch("?filters=abc")).filters).toBeUndefined();
  });
});
