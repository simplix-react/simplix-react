// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CrudProvider } from "../../adapters/crud-provider";
import { useRouter, type RouterAdapter } from "../../adapters/router-provider";

afterEach(cleanup);

function createMockRouter(): RouterAdapter {
  return {
    navigate: vi.fn(),
    getSearchParams: () => new URLSearchParams(),
    setSearchParams: vi.fn(),
    useCurrentPath: () => "/test",
  };
}

describe("CrudProvider", () => {
  it("provides router adapter to children via useRouter", () => {
    const mockRouter = createMockRouter();

    const { result } = renderHook(() => useRouter(), {
      wrapper: ({ children }) => (
        <CrudProvider router={mockRouter}>{children}</CrudProvider>
      ),
    });

    expect(result.current).toBe(mockRouter);
  });

  it("provides navigate function from the adapter", () => {
    const mockRouter = createMockRouter();

    const { result } = renderHook(() => useRouter(), {
      wrapper: ({ children }) => (
        <CrudProvider router={mockRouter}>{children}</CrudProvider>
      ),
    });

    result.current!.navigate("/new-path");
    expect(mockRouter.navigate).toHaveBeenCalledWith("/new-path");
  });

  it("provides getSearchParams from the adapter", () => {
    const params = new URLSearchParams("page=1&size=10");
    const mockRouter: RouterAdapter = {
      navigate: vi.fn(),
      getSearchParams: () => params,
      setSearchParams: vi.fn(),
      useCurrentPath: () => "/",
    };

    const { result } = renderHook(() => useRouter(), {
      wrapper: ({ children }) => (
        <CrudProvider router={mockRouter}>{children}</CrudProvider>
      ),
    });

    const sp = result.current!.getSearchParams();
    expect(sp.get("page")).toBe("1");
    expect(sp.get("size")).toBe("10");
  });

  it("provides useCurrentPath from the adapter", () => {
    const mockRouter = createMockRouter();

    const { result } = renderHook(() => useRouter(), {
      wrapper: ({ children }) => (
        <CrudProvider router={mockRouter}>{children}</CrudProvider>
      ),
    });

    expect(result.current!.useCurrentPath()).toBe("/test");
  });
});
