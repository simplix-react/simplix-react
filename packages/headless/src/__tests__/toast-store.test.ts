// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import { addToast, runToastAction, useToastStore } from "../toast-store";
import { act, renderHook } from "@testing-library/react";

describe("toast run action", () => {
  it("runs once and closes the toast", () => {
    const run = vi.fn();
    addToast({ type: "success", message: "3건을 정지했습니다", action: { label: "실행 취소", run } });
    const { result } = renderHook(() => useToastStore());
    const id = result.current.find((t) => t.message === "3건을 정지했습니다")!.id;
    act(() => runToastAction(id));
    act(() => runToastAction(id));
    expect(run).toHaveBeenCalledTimes(1);
    expect(result.current.some((t) => t.id === id)).toBe(false);
  });

  it("leaves a link action to the container", () => {
    addToast({ type: "info", message: "보고서를 만들었습니다", action: { label: "열기", href: "/r/1" } });
    const { result } = renderHook(() => useToastStore());
    const id = result.current.find((t) => t.message === "보고서를 만들었습니다")!.id;
    act(() => runToastAction(id));
    expect(result.current.some((t) => t.id === id)).toBe(true);
  });
});
