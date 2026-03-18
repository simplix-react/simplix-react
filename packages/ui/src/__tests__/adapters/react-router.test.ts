// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createReactRouterAdapter, type ReactRouterHooks } from "../../adapters/react-router";

function createMockHooks(): ReactRouterHooks {
  const navigateFn = vi.fn();
  const setSearchParamsFn = vi.fn();
  const searchParams = new URLSearchParams("q=test");

  return {
    useNavigate: () => navigateFn,
    useSearchParams: () => [searchParams, setSearchParamsFn],
    useLocation: () => ({ pathname: "/current-path" }),
  };
}

describe("createReactRouterAdapter", () => {
  it("returns a RouterAdapter object", () => {
    const hooks = createMockHooks();
    const { result } = renderHook(() => createReactRouterAdapter(hooks));
    const adapter = result.current;

    expect(adapter).toHaveProperty("navigate");
    expect(adapter).toHaveProperty("getSearchParams");
    expect(adapter).toHaveProperty("setSearchParams");
    expect(adapter).toHaveProperty("useCurrentPath");
  });

  it("navigate delegates to useNavigate result", () => {
    const navigateFn = vi.fn();
    const hooks: ReactRouterHooks = {
      useNavigate: () => navigateFn,
      useSearchParams: () => [new URLSearchParams(), vi.fn()],
      useLocation: () => ({ pathname: "/" }),
    };

    const { result } = renderHook(() => createReactRouterAdapter(hooks));
    result.current.navigate("/new-route");

    expect(navigateFn).toHaveBeenCalledWith("/new-route", undefined);
  });

  it("navigate passes options through", () => {
    const navigateFn = vi.fn();
    const hooks: ReactRouterHooks = {
      useNavigate: () => navigateFn,
      useSearchParams: () => [new URLSearchParams(), vi.fn()],
      useLocation: () => ({ pathname: "/" }),
    };

    const { result } = renderHook(() => createReactRouterAdapter(hooks));
    result.current.navigate("/path", { replace: true });

    expect(navigateFn).toHaveBeenCalledWith("/path", { replace: true });
  });

  it("getSearchParams returns current search params", () => {
    const params = new URLSearchParams("page=2&sort=name");
    const hooks: ReactRouterHooks = {
      useNavigate: () => vi.fn(),
      useSearchParams: () => [params, vi.fn()],
      useLocation: () => ({ pathname: "/" }),
    };

    const { result } = renderHook(() => createReactRouterAdapter(hooks));
    const sp = result.current.getSearchParams();

    expect(sp.get("page")).toBe("2");
    expect(sp.get("sort")).toBe("name");
  });

  it("setSearchParams delegates to useSearchParams setter", () => {
    const setFn = vi.fn();
    const hooks: ReactRouterHooks = {
      useNavigate: () => vi.fn(),
      useSearchParams: () => [new URLSearchParams(), setFn],
      useLocation: () => ({ pathname: "/" }),
    };

    const { result } = renderHook(() => createReactRouterAdapter(hooks));
    const newParams = new URLSearchParams("filter=active");
    result.current.setSearchParams(newParams);

    expect(setFn).toHaveBeenCalledWith(newParams, undefined);
  });

  it("setSearchParams passes options through", () => {
    const setFn = vi.fn();
    const hooks: ReactRouterHooks = {
      useNavigate: () => vi.fn(),
      useSearchParams: () => [new URLSearchParams(), setFn],
      useLocation: () => ({ pathname: "/" }),
    };

    const { result } = renderHook(() => createReactRouterAdapter(hooks));
    const newParams = new URLSearchParams("x=1");
    result.current.setSearchParams(newParams, { replace: true });

    expect(setFn).toHaveBeenCalledWith(newParams, { replace: true });
  });

  it("useCurrentPath returns pathname from useLocation", () => {
    const hooks: ReactRouterHooks = {
      useNavigate: () => vi.fn(),
      useSearchParams: () => [new URLSearchParams(), vi.fn()],
      useLocation: () => ({ pathname: "/users/123" }),
    };

    const { result } = renderHook(() => createReactRouterAdapter(hooks));
    expect(result.current.useCurrentPath()).toBe("/users/123");
  });
});
