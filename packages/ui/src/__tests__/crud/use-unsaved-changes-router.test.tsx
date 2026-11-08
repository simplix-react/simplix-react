// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

vi.mock("../../crud/form/use-before-unload", () => ({
  useBeforeUnload: vi.fn(),
}));

import { createReactRouterAdapter, type ReactRouterHooks } from "../../adapters/react-router";
import { RouterContext, type RouterAdapter } from "../../adapters/router-provider";
import { createTanstackRouterAdapter, type TanstackRouterLike } from "../../adapters/tanstack-router";
import { useUnsavedChanges } from "../../crud/form/use-unsaved-changes";

afterEach(cleanup);

type Blocker = { blockerFn: () => Promise<boolean> | boolean; enableBeforeUnload?: boolean };

/**
 * A router with the contract of TanStack's `history.block`: every move (a push, or Back and
 * Forward from the address bar) first asks each registered `blockerFn`, and a truthy answer drops
 * the move. Back and Forward take the same path as a push because the browser history asks its
 * blockers on `popstate` and undoes the move when one answers truthy.
 */
class FakeTanstackRouter implements TanstackRouterLike {
  private entries = ["/form"];
  private index = 0;
  private blockers: Blocker[] = [];
  private listeners = new Set<() => void>();

  get state() {
    return { location: { pathname: this.entries[this.index] ?? "/", searchStr: "" } };
  }

  readonly history = {
    block: (blocker: Blocker) => {
      this.blockers = [...this.blockers, blocker];
      return () => {
        this.blockers = this.blockers.filter((b) => b !== blocker);
      };
    },
  };

  subscribe(_event: "onBeforeLoad" | "onLoad" | "onResolved", fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  get blockerCount() {
    return this.blockers.length;
  }

  private async attempt(nextIndex: number, write: () => void) {
    for (const blocker of this.blockers) {
      if (await blocker.blockerFn()) return;
    }
    this.index = nextIndex;
    write();
    this.listeners.forEach((fn) => fn());
  }

  navigate({ to }: { to: string }) {
    return this.attempt(this.index + 1, () => {
      this.entries = [...this.entries.slice(0, this.index), to];
    });
  }

  back() {
    return this.attempt(Math.max(0, this.index - 1), () => {});
  }

  push(to: string) {
    this.entries = [...this.entries, to];
    this.index = this.entries.length - 1;
  }
}

function Form({ isDirty, adapterNavigate }: { isDirty: boolean; adapterNavigate?: (to: string) => void }) {
  const { guardedNavigate, dialog } = useUnsavedChanges({ isDirty });
  return (
    <div>
      <button data-testid="cancel" onClick={() => guardedNavigate(() => adapterNavigate?.("/list"))}>
        Cancel
      </button>
      {dialog}
    </div>
  );
}

function mount(router: FakeTanstackRouter, isDirty: boolean) {
  const adapter = createTanstackRouterAdapter(router);
  return {
    adapter,
    ...render(
      <RouterContext.Provider value={adapter}>
        <Form isDirty={isDirty} adapterNavigate={(to) => adapter.navigate(to)} />
      </RouterContext.Provider>,
    ),
  };
}

describe("useUnsavedChanges with a TanStack router adapter", () => {
  it("holds a push while dirty and leaves on Discard", async () => {
    const router = new FakeTanstackRouter();
    mount(router, true);
    expect(router.blockerCount).toBe(1);

    await act(async () => {
      void router.navigate({ to: "/menu" });
    });
    expect(screen.getByText("common.unsavedTitle")).toBeTruthy();
    expect(router.state.location.pathname).toBe("/form");

    await act(async () => {
      fireEvent.click(screen.getByText("common.discard"));
    });
    await waitFor(() => expect(router.state.location.pathname).toBe("/menu"));
    expect(screen.queryByText("common.unsavedTitle")).toBeNull();
  });

  it("holds Back while dirty and stays on Cancel", async () => {
    const router = new FakeTanstackRouter();
    router.push("/form-2");
    mount(router, true);

    await act(async () => {
      void router.back();
    });
    expect(screen.getByText("common.unsavedTitle")).toBeTruthy();
    expect(router.state.location.pathname).toBe("/form-2");

    await act(async () => {
      fireEvent.click(screen.getByText("common.cancel"));
    });
    expect(screen.queryByText("common.unsavedTitle")).toBeNull();
    expect(router.state.location.pathname).toBe("/form-2");

    // After staying, the next move is held again.
    await act(async () => {
      void router.back();
    });
    expect(screen.getByText("common.unsavedTitle")).toBeTruthy();
  });

  it("lets Back through on Discard", async () => {
    const router = new FakeTanstackRouter();
    router.push("/form-2");
    mount(router, true);
    await act(async () => {
      void router.back();
    });
    await act(async () => {
      fireEvent.click(screen.getByText("common.discard"));
    });
    await waitFor(() => expect(router.state.location.pathname).toBe("/form"));
  });

  it("lets a clean form leave by push and by Back with no dialog", async () => {
    const router = new FakeTanstackRouter();
    mount(router, false);
    expect(router.blockerCount).toBe(0);

    await act(async () => {
      await router.navigate({ to: "/menu" });
    });
    expect(router.state.location.pathname).toBe("/menu");
    await act(async () => {
      await router.back();
    });
    expect(router.state.location.pathname).toBe("/form");
    expect(screen.queryByText("common.unsavedTitle")).toBeNull();
  });

  it("stops holding once the form is clean again", async () => {
    const router = new FakeTanstackRouter();
    const adapter = createTanstackRouterAdapter(router);
    const view = render(
      <RouterContext.Provider value={adapter}>
        <Form isDirty />
      </RouterContext.Provider>,
    );
    expect(router.blockerCount).toBe(1);
    view.rerender(
      <RouterContext.Provider value={adapter}>
        <Form isDirty={false} />
      </RouterContext.Provider>,
    );
    expect(router.blockerCount).toBe(0);
    view.unmount();
    expect(router.blockerCount).toBe(0);
  });

  it("asks once when a wrapped callback navigates while the blocker is registered", async () => {
    const router = new FakeTanstackRouter();
    mount(router, true);

    fireEvent.click(screen.getByTestId("cancel"));
    expect(screen.getByText("common.unsavedTitle")).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByText("common.discard"));
    });
    await waitFor(() => expect(router.state.location.pathname).toBe("/list"));
    // No second dialog opened for the callback's own navigation.
    expect(screen.queryByText("common.unsavedTitle")).toBeNull();
  });

  it("guards the route again after a confirmed callback that did not leave", async () => {
    const router = new FakeTanstackRouter();
    const adapter = createTanstackRouterAdapter(router);
    render(
      <RouterContext.Provider value={adapter}>
        <Form isDirty adapterNavigate={() => undefined} />
      </RouterContext.Provider>,
    );
    fireEvent.click(screen.getByTestId("cancel"));
    await act(async () => {
      fireEvent.click(screen.getByText("common.discard"));
    });
    expect(router.blockerCount).toBe(1);
  });

  it("offers no blocker when the router has no history", () => {
    const router = new FakeTanstackRouter();
    const adapter = createTanstackRouterAdapter({
      state: router.state,
      navigate: (options) => router.navigate(options),
      subscribe: (event, fn) => router.subscribe(event, fn),
    });
    expect(adapter.useBlocker).toBeUndefined();
  });
});

describe("useUnsavedChanges with a React Router adapter", () => {
  function setup() {
    const proceed = vi.fn();
    const reset = vi.fn();
    const mocks = { state: "unblocked" as "unblocked" | "blocked", enabledSeen: [] as boolean[] };
    const hooks: ReactRouterHooks = {
      useNavigate: () => vi.fn(),
      useSearchParams: () => [new URLSearchParams(), vi.fn()],
      useLocation: () => ({ pathname: "/form" }),
      useBlocker: (shouldBlock) => {
        mocks.enabledSeen.push(shouldBlock);
        return { state: shouldBlock ? mocks.state : "unblocked", proceed, reset };
      },
    };
    function Host({ isDirty }: { isDirty: boolean }) {
      const adapter: RouterAdapter = createReactRouterAdapter(hooks);
      return (
        <RouterContext.Provider value={adapter}>
          <Form isDirty={isDirty} />
        </RouterContext.Provider>
      );
    }
    return { proceed, reset, mocks, Host };
  }

  it("opens the dialog when the router reports a blocked navigation and proceeds on Discard", () => {
    const { proceed, reset, mocks, Host } = setup();
    const view = render(<Host isDirty />);
    expect(screen.queryByText("common.unsavedTitle")).toBeNull();

    mocks.state = "blocked";
    view.rerender(<Host isDirty />);
    expect(screen.getByText("common.unsavedTitle")).toBeTruthy();

    fireEvent.click(screen.getByText("common.discard"));
    expect(proceed).toHaveBeenCalledTimes(1);
    expect(reset).not.toHaveBeenCalled();
  });

  it("resets the blocker on Cancel", () => {
    const { proceed, reset, mocks, Host } = setup();
    mocks.state = "blocked";
    render(<Host isDirty />);
    fireEvent.click(screen.getByText("common.cancel"));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(proceed).not.toHaveBeenCalled();
  });

  it("asks the router to block only while dirty", () => {
    const { mocks, Host } = setup();
    const view = render(<Host isDirty={false} />);
    expect(mocks.enabledSeen.every((enabled) => enabled === false)).toBe(true);
    view.rerender(<Host isDirty />);
    expect(mocks.enabledSeen.at(-1)).toBe(true);
  });

  it("keeps an adapter without useBlocker working", () => {
    const hooks: ReactRouterHooks = {
      useNavigate: () => vi.fn(),
      useSearchParams: () => [new URLSearchParams(), vi.fn()],
      useLocation: () => ({ pathname: "/form" }),
    };
    function Host() {
      const [left, setLeft] = useState(false);
      const adapter = createReactRouterAdapter(hooks);
      expect(adapter.useBlocker).toBeUndefined();
      return (
        <RouterContext.Provider value={adapter}>
          <Form isDirty adapterNavigate={() => setLeft(true)} />
          {left ? <span data-testid="left" /> : null}
        </RouterContext.Provider>
      );
    }
    render(<Host />);
    fireEvent.click(screen.getByTestId("cancel"));
    fireEvent.click(screen.getByText("common.discard"));
    expect(screen.getByTestId("left")).toBeTruthy();
  });
});
