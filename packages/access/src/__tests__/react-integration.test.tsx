// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, render, screen, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { createAccessPolicy } from "../create-access-policy.js";
import { createStaticAdapter } from "../adapters/static-adapter.js";
import { AccessDeniedError } from "../errors.js";
import { AccessProvider, AccessContext } from "../react/access-provider.js";
import { useAccess } from "../react/use-access.js";
import { useCan } from "../react/use-can.js";
import { Can } from "../react/can.js";
import { useMenuFilter } from "../react/use-menu-filter.js";
import { requireAccess } from "../react/route-guard.js";
import type { AccessPolicy, AccessUser } from "../types.js";
import type { AuthLike } from "../react/access-provider.js";

// ── Helpers ──

const testUser: AccessUser = {
  userId: "user-1",
  username: "john",
  displayName: "John Doe",
  roles: ["ROLE_ADMIN"],
};

function createPolicy(
  rules: Array<{ action: string; subject: string }> = [],
  user?: AccessUser,
): AccessPolicy<string, string> {
  const policy = createAccessPolicy({
    adapter: createStaticAdapter(rules, user),
  });
  if (rules.length > 0 || user) {
    policy.setRules(rules, user, user?.roles);
  }
  return policy;
}

function createWrapper(policy: AccessPolicy<string, string>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(AccessProvider, { policy }, children);
  };
}

// ── AccessProvider ──

describe("AccessProvider", () => {
  it("renders children", () => {
    const policy = createPolicy();

    render(
      createElement(AccessProvider, { policy }, createElement("span", null, "child content")),
    );

    expect(screen.getByText("child content")).toBeDefined();
  });

  it("provides policy via context", () => {
    const policy = createPolicy(
      [{ action: "view", subject: "Pet" }],
      testUser,
    );

    const { result } = renderHook(() => useAccess(), {
      wrapper: createWrapper(policy),
    });

    expect(result.current.can("view", "Pet")).toBe(true);
    expect(result.current.user).toEqual(testUser);
  });

  it("calls rehydrate and syncs with auth on mount", async () => {
    const policy = createPolicy();
    const rehydrateSpy = vi.spyOn(policy, "rehydrate");
    const updateSpy = vi.spyOn(policy, "update");

    const auth: AuthLike = {
      isAuthenticated: () => true,
      getAccessToken: () => "test-token",
      subscribe: () => () => {},
    };

    render(
      createElement(AccessProvider, { policy, auth }, createElement("div", null, "test")),
    );

    expect(rehydrateSpy).toHaveBeenCalledOnce();
    // update is called asynchronously via sync()
    await vi.waitFor(() => expect(updateSpy).toHaveBeenCalledWith("test-token"));
  });

  it("subscribes to auth changes", () => {
    const policy = createPolicy();
    const subscribeFn = vi.fn(() => () => {});

    const auth: AuthLike = {
      isAuthenticated: () => false,
      getAccessToken: () => null,
      subscribe: subscribeFn,
    };

    render(
      createElement(AccessProvider, { policy, auth }, createElement("div", null, "test")),
    );

    expect(subscribeFn).toHaveBeenCalledOnce();
  });

  it("clears policy and loads public access when auth is not authenticated", async () => {
    const policy = createPolicy([{ action: "view", subject: "Pet" }], testUser);
    const clearSpy = vi.spyOn(policy, "clear");
    const loadPublicSpy = vi.spyOn(policy, "loadPublicAccess");

    const auth: AuthLike = {
      isAuthenticated: () => false,
      getAccessToken: () => null,
      subscribe: () => () => {},
    };

    render(
      createElement(AccessProvider, { policy, auth }, createElement("div", null, "test")),
    );

    await vi.waitFor(() => {
      expect(clearSpy).toHaveBeenCalled();
      expect(loadPublicSpy).toHaveBeenCalled();
    });
  });
});

// ── useAccess ──

describe("useAccess", () => {
  it("returns the policy from context", () => {
    const policy = createPolicy(
      [{ action: "edit", subject: "Pet" }],
      testUser,
    );

    const { result } = renderHook(() => useAccess(), {
      wrapper: createWrapper(policy),
    });

    expect(result.current).toBe(policy);
  });

  it("throws when used outside AccessProvider", () => {
    expect(() => {
      renderHook(() => useAccess());
    }).toThrow("useAccess must be used within an <AccessProvider>");
  });
});

// ── useCan ──

describe("useCan", () => {
  it("returns true when action is allowed", () => {
    const policy = createPolicy([{ action: "view", subject: "Pet" }]);

    const { result } = renderHook(() => useCan("view", "Pet"), {
      wrapper: createWrapper(policy),
    });

    expect(result.current).toBe(true);
  });

  it("returns false when action is denied", () => {
    const policy = createPolicy([{ action: "view", subject: "Pet" }]);

    const { result } = renderHook(() => useCan("delete", "Pet"), {
      wrapper: createWrapper(policy),
    });

    expect(result.current).toBe(false);
  });

  it("returns true when no AccessProvider is present (opt-in)", () => {
    const { result } = renderHook(() => useCan("delete", "anything"));

    expect(result.current).toBe(true);
  });

  it("reacts to policy changes", () => {
    const policy = createPolicy();

    const { result } = renderHook(() => useCan("view", "Pet"), {
      wrapper: createWrapper(policy),
    });

    expect(result.current).toBe(false);

    act(() => {
      policy.setRules([{ action: "view", subject: "Pet" }]);
    });

    expect(result.current).toBe(true);
  });
});

// ── Can ──

describe("Can", () => {
  it("renders children when permission is allowed", () => {
    const policy = createPolicy([{ action: "edit", subject: "Pet" }]);

    render(
      createElement(
        AccessProvider,
        { policy },
        createElement(Can, { I: "edit", a: "Pet" }, createElement("span", null, "Edit Button")),
      ),
    );

    expect(screen.getByText("Edit Button")).toBeDefined();
  });

  it("renders nothing when permission is denied", () => {
    const policy = createPolicy([{ action: "view", subject: "Pet" }]);

    render(
      createElement(
        AccessProvider,
        { policy },
        createElement(Can, { I: "delete", a: "Pet" }, createElement("span", null, "Delete Button")),
      ),
    );

    expect(screen.queryByText("Delete Button")).toBeNull();
  });

  it("renders fallback when permission is denied", () => {
    const policy = createPolicy([{ action: "view", subject: "Pet" }]);

    render(
      createElement(
        AccessProvider,
        { policy },
        createElement(
          Can,
          {
            I: "delete",
            a: "Pet",
            fallback: createElement("span", null, "No permission"),
          },
          createElement("span", null, "Delete Button"),
        ),
      ),
    );

    expect(screen.queryByText("Delete Button")).toBeNull();
    expect(screen.getByText("No permission")).toBeDefined();
  });

  it("inverts logic when not prop is true", () => {
    const policy = createPolicy([{ action: "view", subject: "Pet" }]);

    render(
      createElement(
        AccessProvider,
        { policy },
        createElement(
          Can,
          { I: "view", a: "Pet", not: true },
          createElement("span", null, "Hidden when allowed"),
        ),
      ),
    );

    expect(screen.queryByText("Hidden when allowed")).toBeNull();
  });

  it("renders children when not + denied", () => {
    const policy = createPolicy([]);

    render(
      createElement(
        AccessProvider,
        { policy },
        createElement(
          Can,
          { I: "edit", a: "Pet", not: true },
          createElement("span", null, "Shown when denied"),
        ),
      ),
    );

    expect(screen.getByText("Shown when denied")).toBeDefined();
  });

  it("renders children when no AccessProvider is present (opt-in)", () => {
    render(
      createElement(Can, { I: "anything", a: "anywhere" }, createElement("span", null, "Always shown")),
    );

    expect(screen.getByText("Always shown")).toBeDefined();
  });
});

// ── useMenuFilter ──

describe("useMenuFilter", () => {
  it("filters items by permission", () => {
    const policy = createPolicy([{ action: "list", subject: "Pet" }]);

    const menu = [
      { label: "Pets", permission: { action: "list", subject: "Pet" } },
      { label: "Orders", permission: { action: "list", subject: "Order" } },
    ];

    const { result } = renderHook(() => useMenuFilter(menu), {
      wrapper: createWrapper(policy),
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].label).toBe("Pets");
  });

  it("shows items without permission property", () => {
    const policy = createPolicy([]);

    const menu = [
      { label: "Dashboard" },
      { label: "Pets", permission: { action: "list", subject: "Pet" } },
    ];

    const { result } = renderHook(() => useMenuFilter(menu), {
      wrapper: createWrapper(policy),
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].label).toBe("Dashboard");
  });

  it("filters nested children recursively", () => {
    const policy = createPolicy([{ action: "list", subject: "Pet" }]);

    const menu = [
      {
        label: "Admin",
        children: [
          { label: "Pets", permission: { action: "list", subject: "Pet" } },
          { label: "Users", permission: { action: "list", subject: "User" } },
        ],
      },
    ];

    const { result } = renderHook(() => useMenuFilter(menu), {
      wrapper: createWrapper(policy),
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].children).toHaveLength(1);
    expect(result.current[0].children![0].label).toBe("Pets");
  });

  it("removes parent when all children are filtered out", () => {
    const policy = createPolicy([]);

    const menu = [
      {
        label: "Admin",
        children: [
          { label: "Users", permission: { action: "list", subject: "User" } },
        ],
      },
    ];

    const { result } = renderHook(() => useMenuFilter(menu), {
      wrapper: createWrapper(policy),
    });

    expect(result.current).toHaveLength(0);
  });

  it("returns all items when no AccessProvider is present (opt-in)", () => {
    const menu = [
      { label: "Pets", permission: { action: "list", subject: "Pet" } },
      { label: "Orders", permission: { action: "list", subject: "Order" } },
    ];

    const { result } = renderHook(() => useMenuFilter(menu));

    expect(result.current).toHaveLength(2);
  });

  it("reacts to policy changes", () => {
    const policy = createPolicy([]);

    const menu = [
      { label: "Pets", permission: { action: "list", subject: "Pet" } },
    ];

    const { result } = renderHook(() => useMenuFilter(menu), {
      wrapper: createWrapper(policy),
    });

    expect(result.current).toHaveLength(0);

    act(() => {
      policy.setRules([{ action: "list", subject: "Pet" }]);
    });

    expect(result.current).toHaveLength(1);
  });
});

// ── requireAccess ──

describe("requireAccess", () => {
  let storage: Storage;

  beforeEach(() => {
    const store = new Map<string, string>();
    storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      get length() { return store.size; },
      key: () => null,
    } as Storage;

    // Assign to globalThis for storage fallback tests
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      writable: true,
      configurable: true,
    });
  });

  it("passes when policy allows the action", () => {
    const policy = createPolicy([{ action: "view", subject: "Dashboard" }]);

    expect(() => {
      requireAccess(policy, { action: "view", subject: "Dashboard" });
    }).not.toThrow();
  });

  it("throws AccessDeniedError when policy denies the action", () => {
    const policy = createPolicy([]);

    expect(() => {
      requireAccess(policy, { action: "view", subject: "Admin" });
    }).toThrow(AccessDeniedError);
  });

  it("includes action and subject in the thrown error", () => {
    const policy = createPolicy([]);

    try {
      requireAccess(policy, { action: "delete", subject: "Pet" });
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AccessDeniedError);
      const accessErr = err as AccessDeniedError;
      expect(accessErr.action).toBe("delete");
      expect(accessErr.subject).toBe("Pet");
    }
  });

  it("falls back to storage check when policy denies", () => {
    const policy = createPolicy([]);
    storage.setItem("simplix-access", JSON.stringify({ rules: [{ action: "view", subject: "Admin" }] }));

    expect(() => {
      requireAccess(policy, {
        action: "view",
        subject: "Admin",
        storageFallback: {
          key: "simplix-access",
          check: (stored) => Array.isArray((stored as { rules?: unknown })?.rules),
        },
      });
    }).not.toThrow();
  });

  it("throws when storage fallback check returns false", () => {
    const policy = createPolicy([]);
    storage.setItem("simplix-access", JSON.stringify({ rules: [] }));

    expect(() => {
      requireAccess(policy, {
        action: "view",
        subject: "Admin",
        storageFallback: {
          key: "simplix-access",
          check: () => false,
        },
      });
    }).toThrow(AccessDeniedError);
  });

  it("throws when storage key does not exist", () => {
    const policy = createPolicy([]);

    expect(() => {
      requireAccess(policy, {
        action: "view",
        subject: "Admin",
        storageFallback: {
          key: "nonexistent-key",
          check: () => true,
        },
      });
    }).toThrow(AccessDeniedError);
  });

  it("throws when storage contains invalid JSON", () => {
    const policy = createPolicy([]);
    storage.setItem("simplix-access", "not-json");

    expect(() => {
      requireAccess(policy, {
        action: "view",
        subject: "Admin",
        storageFallback: {
          key: "simplix-access",
          check: () => true,
        },
      });
    }).toThrow(AccessDeniedError);
  });

  it("does not use storage fallback when policy allows", () => {
    const policy = createPolicy([{ action: "view", subject: "Admin" }]);
    const checkFn = vi.fn(() => true);

    requireAccess(policy, {
      action: "view",
      subject: "Admin",
      storageFallback: {
        key: "simplix-access",
        check: checkFn,
      },
    });

    expect(checkFn).not.toHaveBeenCalled();
  });
});
