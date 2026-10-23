// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToastContainer } from "../../base/feedback/toast-container";
import { addToast } from "../../base/feedback/toast-store";
import { BulkActionBar, DigitRoll, LegendToggle, useSeriesVisibility } from "../../interaction";

afterEach(cleanup);

describe("DigitRoll", () => {
  it("reads the whole figure once and moves each digit column to its digit", () => {
    const { container } = render(<DigitRoll value={1204} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("1,204");
    const columns = container.querySelectorAll("[data-slot=digit-roll-column]");
    expect(columns).toHaveLength(4);
    expect((columns[1] as HTMLElement).style.transform).toBe("translateY(-2lh)");
  });

  it("keeps a digit's column when the value changes, so it can roll", () => {
    const { container, rerender } = render(<DigitRoll value={19} />);
    const before = container.querySelectorAll("[data-slot=digit-roll-column]")[1];
    rerender(<DigitRoll value={20} />);
    const after = container.querySelectorAll("[data-slot=digit-roll-column]")[1];
    expect(after).toBe(before);
    expect((after as HTMLElement).style.transform).toBe("translateY(0lh)");
  });
});

describe("useSeriesVisibility", () => {
  it("hides a series and refuses to hide the last one shown", () => {
    const { result } = renderHook(() => useSeriesVisibility(["a", "b"]));
    act(() => result.current.toggle("a"));
    expect(result.current.isShown("a")).toBe(false);
    act(() => result.current.toggle("b"));
    expect(result.current.isShown("b")).toBe(true);
    act(() => result.current.toggle("a"));
    expect(result.current.isShown("a")).toBe(true);
  });

  it("marks each legend entry pressed while its series shows", () => {
    const onToggle = vi.fn();
    render(
      <LegendToggle
        series={[{ key: "a", label: "발급", color: "red" }, { key: "b", label: "반납", color: "blue" }]}
        hidden={new Set(["b"])}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByRole("button", { name: "발급" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "반납" }).getAttribute("data-shown")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "반납" }));
    expect(onToggle).toHaveBeenCalledWith("b");
  });
});

describe("BulkActionBar", () => {
  it("is hidden while nothing is selected and clears on Escape", () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <BulkActionBar count={0} countLabel="건 선택됨" onClear={onClear} clearLabel="선택 해제">
        <button type="button">정지</button>
      </BulkActionBar>,
    );
    expect(screen.getByRole("toolbar", { hidden: true }).getAttribute("data-open")).toBe("false");
    rerender(
      <BulkActionBar count={3} countLabel="건 선택됨" onClear={onClear} clearLabel="선택 해제">
        <button type="button">정지</button>
      </BulkActionBar>,
    );
    const bar = screen.getByRole("toolbar");
    expect(bar.getAttribute("data-open")).toBe("true");
    fireEvent.keyDown(bar, { key: "Escape" });
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe("ToastContainer run action", () => {
  it("draws a run action as a button that runs once and closes the toast", async () => {
    const run = vi.fn();
    render(<ToastContainer />);
    act(() => addToast({ type: "success", message: "2건을 정지했습니다", action: { label: "실행 취소", run } }));
    const undo = await screen.findByRole("button", { name: "실행 취소" });
    fireEvent.click(undo);
    expect(run).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "실행 취소" })).toBeNull();
  });
});
