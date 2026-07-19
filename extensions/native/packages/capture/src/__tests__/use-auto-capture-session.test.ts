// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAutoCaptureSession } from "../use-auto-capture-session";

const FACE = [{ x: 0.35, y: 0.35, width: 0.3, height: 0.3 }];

describe("useAutoCaptureSession", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(overrides?: Partial<Parameters<typeof useAutoCaptureSession>[0]>) {
    const takePhoto = vi.fn().mockResolvedValue("file:///photo.jpg");
    const onCaptured = vi.fn();
    const hook = renderHook(() =>
      useAutoCaptureSession({
        takePhoto,
        onCaptured,
        sustainMs: 500,
        countdownFrom: 3,
        countdownTickMs: 100,
        ...overrides,
      }),
    );
    return { ...hook, takePhoto, onCaptured };
  }

  it("moves searching → holding → countdown → captured", async () => {
    const { result, takePhoto, onCaptured } = setup();
    expect(result.current.phase).toBe("searching");

    act(() => result.current.reportFaces(FACE));
    expect(result.current.phase).toBe("holding");

    // Sustain window passes, next report starts the countdown.
    act(() => {
      vi.advanceTimersByTime(600);
      result.current.reportFaces(FACE);
    });
    expect(result.current.phase).toBe("countdown");
    expect(result.current.countdown).toBe(3);

    // 3 ticks: 3 → 2 → 1 → capture.
    await act(async () => {
      vi.advanceTimersByTime(300);
      await vi.runOnlyPendingTimersAsync();
    });
    expect(takePhoto).toHaveBeenCalledTimes(1);
    expect(result.current.phase).toBe("captured");
    expect(result.current.photoUri).toBe("file:///photo.jpg");
    expect(onCaptured).toHaveBeenCalledWith("file:///photo.jpg");
  });

  it("aborts the countdown when composition breaks", () => {
    const { result } = setup();
    act(() => result.current.reportFaces(FACE));
    act(() => {
      vi.advanceTimersByTime(600);
      result.current.reportFaces(FACE);
    });
    expect(result.current.phase).toBe("countdown");

    act(() => result.current.reportFaces([]));
    expect(result.current.phase).toBe("searching");
    expect(result.current.countdown).toBeNull();
    expect(result.current.failure).toBe("no-face");
  });

  it("supports retake back to searching", async () => {
    const { result } = setup();
    act(() => result.current.captureNow());
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    expect(result.current.phase).toBe("captured");

    act(() => result.current.retake());
    expect(result.current.phase).toBe("searching");
    expect(result.current.photoUri).toBeNull();
  });

  it("ignores face reports in manual mode and captures on demand", async () => {
    const { result, takePhoto } = setup();
    act(() => result.current.enterManualMode());
    expect(result.current.phase).toBe("manual");

    act(() => result.current.reportFaces(FACE));
    expect(result.current.phase).toBe("manual");

    act(() => result.current.captureNow());
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    expect(takePhoto).toHaveBeenCalled();
    expect(result.current.phase).toBe("captured");
  });

  it("returns to the origin phase when the camera fails", async () => {
    const takePhoto = vi.fn().mockRejectedValue(new Error("camera gone"));
    const onCaptureError = vi.fn();
    const { result } = renderHook(() =>
      useAutoCaptureSession({ takePhoto, onCaptureError }),
    );

    act(() => result.current.captureNow());
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    expect(result.current.phase).toBe("searching");
    expect(onCaptureError).toHaveBeenCalled();
  });
});
