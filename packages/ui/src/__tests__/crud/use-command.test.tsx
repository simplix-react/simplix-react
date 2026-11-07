// @vitest-environment jsdom
import { removeToast, useToastStore } from "@simplix-react/headless";
import { MutationCache, QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { runWithToast, useCommand, type CommandMutationHook } from "../../crud/form/use-command";

afterEach(() => {
  cleanup();
  const { result } = renderHook(() => useToastStore());
  for (const toast of result.current) removeToast(toast.id);
  cleanup();
});

/** A refusal the way the boot mutator raises one: an Error whose message is the server's sentence. */
class Refusal extends Error {}

/** A client whose mutation cache records which failures would have raised the app's error dialog. */
function clientWithDialog() {
  const dialogs: unknown[] = [];
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.meta?.suppressErrorDialog) return;
        dialogs.push(error);
      },
    }),
  });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, dialogs, wrapper };
}

/** A generated-hook stand-in: the options object goes straight to useMutation, as Orval's does. */
function hookFor(fn: (vars: { id: string }) => Promise<string>): CommandMutationHook<{ id: string }, string> {
  return (options) => useMutation({ mutationFn: fn, ...options?.mutation });
}

function toasts() {
  const { result } = renderHook(() => useToastStore());
  return result.current.map(({ type, message }) => ({ type, message }));
}

describe("useCommand", () => {
  it("toasts the done words, refreshes what it names, and resolves with the data", async () => {
    const { client, wrapper } = clientWithDialog();
    const read = vi.fn(async () => "row");
    renderHook(() => useQuery({ queryKey: ["/api/v1/admin/thing/search", { page: 0 }], queryFn: read }), { wrapper });
    await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(1));

    const { result } = renderHook(
      () => useCommand(hookFor(async ({ id }) => `answer ${id}`), {
        done: (data, vars) => `Done ${vars.id} with ${data}`,
        failed: "Could not",
        invalidate: ["/api/v1/admin/thing"],
      }),
      { wrapper },
    );
    let outcome: Awaited<ReturnType<typeof result.current.run>> | undefined;
    await act(async () => {
      outcome = await result.current.run({ id: "7" });
    });

    expect(outcome).toEqual({ ok: true, data: "answer 7" });
    expect(toasts()).toEqual([{ type: "success", message: "Done 7 with answer 7" }]);
    expect(read).toHaveBeenCalledTimes(2);
    expect(client.getMutationCache().getAll()).toHaveLength(1);
  });

  it("says a refusal once: the server's reason in the toast and no error dialog", async () => {
    const { dialogs, wrapper } = clientWithDialog();
    const { result } = renderHook(
      () => useCommand(hookFor(async () => { throw new Refusal("The breaker is already closed."); }), {
        done: "Reset",
        failed: (reason, vars) => `Could not reset ${vars.id}: ${reason}`,
      }),
      { wrapper },
    );
    let outcome: Awaited<ReturnType<typeof result.current.run>> | undefined;
    await act(async () => {
      outcome = await result.current.run({ id: "b1" });
    });

    expect(outcome?.ok).toBe(false);
    expect(toasts()).toEqual([{ type: "error", message: "Could not reset b1: The breaker is already closed." }]);
    expect(dialogs).toEqual([]);
  });

  it("shows the server's sentence in place of a plain failure sentence", async () => {
    const { wrapper } = clientWithDialog();
    const { result } = renderHook(
      () => useCommand(hookFor(async () => { throw new Refusal("Only an open breaker can be reset."); }), { done: "Reset", failed: "Could not reset" }),
      { wrapper },
    );
    await act(async () => {
      await result.current.run({ id: "b1" });
    });
    expect(toasts()).toEqual([{ type: "error", message: "Only an open breaker can be reset." }]);
  });

  it("falls back to its own sentence when the server sent none", async () => {
    const { wrapper } = clientWithDialog();
    const { result } = renderHook(
      () => useCommand(hookFor(async () => { throw { status: 500 }; }), { done: "Reset", failed: "Could not reset" }),
      { wrapper },
    );
    await act(async () => {
      await result.current.run({ id: "b1" });
    });
    expect(toasts()).toEqual([{ type: "error", message: "Could not reset" }]);
  });

  it("keeps the error dialog only when asked to", async () => {
    const { dialogs, wrapper } = clientWithDialog();
    const { result } = renderHook(
      () => useCommand(hookFor(async () => { throw new Refusal("No."); }), { done: "Reset", failed: "Could not", keepDialog: true }),
      { wrapper },
    );
    await act(async () => {
      await result.current.run({ id: "b1" });
    });
    expect(dialogs).toHaveLength(1);
  });

  it("refreshes an exact query key as well as a prefix, and does so after a refusal too", async () => {
    const { wrapper } = clientWithDialog();
    const devices = vi.fn(async () => []);
    const other = vi.fn(async () => []);
    renderHook(() => useQuery({ queryKey: ["/api/v1/me/devices"], queryFn: devices }), { wrapper });
    renderHook(() => useQuery({ queryKey: ["/api/v1/me/other"], queryFn: other }), { wrapper });
    await vi.waitFor(() => expect(devices).toHaveBeenCalledTimes(1));

    const { result } = renderHook(
      () => useCommand(hookFor(async () => { throw new Refusal("Gone."); }), { done: "Signed out", failed: "Could not", invalidate: () => [["/api/v1/me/devices"]] }),
      { wrapper },
    );
    await act(async () => {
      await result.current.run({ id: "d1" });
    });
    expect(devices).toHaveBeenCalledTimes(2);
    expect(other).toHaveBeenCalledTimes(1);
  });
});

describe("runWithToast", () => {
  it("toasts success with the value and failure with the server's sentence", async () => {
    await act(async () => {
      expect(await runWithToast(async () => 3, { done: (n) => `Moved ${n}`, failed: "Could not" })).toEqual({ ok: true, data: 3 });
    });
    await act(async () => {
      const outcome = await runWithToast(async () => { throw new Refusal("Locked."); }, { done: "Moved", failed: "Could not" });
      expect(outcome.ok).toBe(false);
    });
    expect(toasts()).toEqual([
      { type: "success", message: "Moved 3" },
      { type: "error", message: "Locked." },
    ]);
  });

  it("calls a failure function with the reason, or undefined when there is none", async () => {
    const failed = vi.fn((reason: string | undefined) => `Could not: ${reason ?? "unknown"}`);
    await act(async () => {
      await runWithToast(async () => { throw "plain"; }, { done: "x", failed });
    });
    expect(failed).toHaveBeenCalledWith(undefined, "plain");
    expect(toasts()).toEqual([{ type: "error", message: "Could not: unknown" }]);
  });
});
