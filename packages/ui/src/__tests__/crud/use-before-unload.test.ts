// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

import { useBeforeUnload } from "../../crud/form/use-before-unload";

describe("useBeforeUnload", () => {
  const addSpy = vi.spyOn(window, "addEventListener");
  const removeSpy = vi.spyOn(window, "removeEventListener");

  afterEach(() => {
    addSpy.mockClear();
    removeSpy.mockClear();
  });

  it("registers beforeunload handler when enabled", () => {
    renderHook(() => useBeforeUnload(true));
    expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("does not register handler when disabled", () => {
    renderHook(() => useBeforeUnload(false));
    expect(addSpy).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("removes handler on unmount", () => {
    const { unmount } = renderHook(() => useBeforeUnload(true));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("removes handler when switching from enabled to disabled", () => {
    const { rerender } = renderHook(
      ({ enabled }) => useBeforeUnload(enabled),
      { initialProps: { enabled: true } },
    );

    rerender({ enabled: false });
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("calls preventDefault on beforeunload event", () => {
    renderHook(() => useBeforeUnload(true));

    const handler = addSpy.mock.calls.find(
      (call) => call[0] === "beforeunload",
    )?.[1] as EventListener;

    const event = new Event("beforeunload");
    const preventSpy = vi.spyOn(event, "preventDefault");
    handler(event);
    expect(preventSpy).toHaveBeenCalled();
  });
});
