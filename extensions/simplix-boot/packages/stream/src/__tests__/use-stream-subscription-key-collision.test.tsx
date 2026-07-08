// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { createElement } from "react";

// Simulate the id collision produced by multiple React roots sharing one
// provider (e.g. a react-konva stage bridges the stream context into its own
// root, whose useId sequence restarts): every hook instance sees the same
// useId value. Registry keys must not be derived from useId, or one
// component's subscription silently overwrites another's.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useId: () => ":collision:" };
});

import { useStreamSubscription } from "../use-stream-subscription";
import { StreamProvider } from "../stream-provider";

function Sub({ resource }: { resource: string }) {
  useStreamSubscription(resource);
  return null;
}

describe("subscription registry key collision", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("keeps every subscription when useId values collide across hook instances", async () => {
    render(
      createElement(StreamProvider, {
        mock: { enabled: true },
        children: [
          createElement(Sub, { key: "health", resource: "middleware-health" }),
          createElement(Sub, { key: "alarms", resource: "alarm-updates" }),
        ],
      }),
    );

    // Flush the debounced subscription sync (setTimeout 0).
    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(fetchMock).toHaveBeenCalled();
    const [, lastInit] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const body = JSON.parse((lastInit as RequestInit).body as string);
    const resources = body.subscriptions.map(
      (s: { resource: string }) => s.resource,
    );
    expect(resources).toContain("middleware-health");
    expect(resources).toContain("alarm-updates");
  });
});
