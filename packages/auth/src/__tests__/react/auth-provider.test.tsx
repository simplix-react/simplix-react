// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider } from "../../react/auth-provider.js";
import { useAuth } from "../../react/use-auth.js";
import { useAuthFetch } from "../../react/use-auth-fetch.js";
import { createAuth } from "../../create-auth.js";
import { bearerScheme } from "../../schemes/bearer-scheme.js";
import { memoryStore } from "../../stores/memory-store.js";
import type { AuthInstance } from "../../types.js";

function createTestAuth() {
  const store = memoryStore();
  const auth = createAuth({
    schemes: [
      bearerScheme({ store, token: () => store.get("access_token") }),
    ],
    store,
  });
  return { auth, store };
}

function createWrapper(auth: AuthInstance) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider auth={auth}>{children}</AuthProvider>;
  };
}

describe("AuthProvider + useAuth", () => {
  it("provides isAuthenticated=false when no token is set", () => {
    const { auth } = createTestAuth();

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(auth),
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it("provides isAuthenticated=true after login", () => {
    const { auth } = createTestAuth();

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(auth),
    });

    act(() => {
      result.current.login({ accessToken: "test-token" });
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it("provides isAuthenticated=false after logout", () => {
    const { auth, store } = createTestAuth();
    store.set("access_token", "test-token");

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(auth),
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns access token via getAccessToken", () => {
    const { auth } = createTestAuth();

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(auth),
    });

    expect(result.current.getAccessToken()).toBeNull();

    act(() => {
      result.current.login({ accessToken: "my-token" });
    });

    expect(result.current.getAccessToken()).toBe("my-token");
  });

  it("re-renders when auth state changes externally", () => {
    const { auth } = createTestAuth();
    const renderCount = vi.fn();

    renderHook(
      () => {
        const result = useAuth();
        renderCount();
        return result;
      },
      { wrapper: createWrapper(auth) },
    );

    const initialCalls = renderCount.mock.calls.length;

    act(() => {
      auth.setTokens({ accessToken: "external-token" });
    });

    expect(renderCount.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it("throws when useAuth is used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an <AuthProvider>");
  });
});

describe("useAuthFetch", () => {
  it("returns the fetchFn from auth instance", () => {
    const { auth } = createTestAuth();

    const { result } = renderHook(() => useAuthFetch(), {
      wrapper: createWrapper(auth),
    });

    expect(result.current).toBe(auth.fetchFn);
  });

  it("throws when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuthFetch());
    }).toThrow("useAuth must be used within an <AuthProvider>");
  });
});
