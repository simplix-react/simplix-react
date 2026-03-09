// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider } from "../../react/auth-provider.js";
import { useAuth } from "../../react/use-auth.js";
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

function createWrapperWithLoader(
  auth: AuthInstance,
  userLoader?: (token: string) => Promise<unknown>,
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthProvider auth={auth} userLoader={userLoader}>
        {children}
      </AuthProvider>
    );
  };
}

describe("AuthProvider with userLoader", () => {
  it("sets isLoading=true initially when userLoader is provided", () => {
    const { auth, store } = createTestAuth();
    store.set("access_token", "stored-token");

    const userLoader = vi.fn().mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapperWithLoader(auth, userLoader),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("sets isLoading=false when no userLoader is provided", () => {
    const { auth } = createTestAuth();

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapperWithLoader(auth),
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("loads user and sets isLoading=false after rehydration", async () => {
    const { auth, store } = createTestAuth();
    store.set("access_token", "valid-token");

    const user = { id: 1, name: "Alice" };
    const userLoader = vi.fn().mockResolvedValue(user);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapperWithLoader(auth, userLoader),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(user);
    expect(userLoader).toHaveBeenCalledWith("valid-token");
  });

  it("clears auth when userLoader fails during initialization", async () => {
    const { auth, store } = createTestAuth();
    store.set("access_token", "bad-token");

    const userLoader = vi.fn().mockRejectedValue(new Error("user not found"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapperWithLoader(auth, userLoader),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("does not load user when no access token exists after rehydration", async () => {
    const { auth } = createTestAuth();

    const userLoader = vi.fn().mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapperWithLoader(auth, userLoader),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(userLoader).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it("reloads user when auth state transitions to authenticated after init", async () => {
    const { auth } = createTestAuth();

    const user = { id: 2, name: "Bob" };
    const userLoader = vi.fn().mockResolvedValue(user);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapperWithLoader(auth, userLoader),
    });

    // Wait for initialization to complete (no token, so no user loaded)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(userLoader).not.toHaveBeenCalled();

    // Login externally
    act(() => {
      auth.setTokens({ accessToken: "new-token" });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(user);
    });

    expect(userLoader).toHaveBeenCalledWith("new-token");
  });
});
