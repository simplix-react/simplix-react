// @vitest-environment jsdom
import { render, act, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";

import { useKeyboardNav, type UseKeyboardNavOptions } from "../../crud/list/use-keyboard-nav";

afterEach(cleanup);

function fireKey(el: HTMLElement, key: string, extra: Partial<KeyboardEvent> = {}) {
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...extra }));
}

/**
 * Wrapper component that uses useKeyboardNav and wires the containerRef
 * to a real DOM element so keydown events are captured.
 */
function EffectWrapper({ options }: { options: UseKeyboardNavOptions }) {
  const { containerRef } = useKeyboardNav(options);

  const callbackRef = (el: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLElement | null>).current = el;
  };

  return (
    <div ref={callbackRef} tabIndex={0} data-testid="container">
      <input type="text" data-testid="text-input" />
      <button type="button" data-testid="btn">Click</button>
      <select data-testid="sel"><option>A</option></select>
      <textarea data-testid="ta" />
    </div>
  );
}

function createOptions(overrides?: Partial<UseKeyboardNavOptions>): UseKeyboardNavOptions {
  return {
    onNavigate: vi.fn(),
    onSelect: vi.fn(),
    onToggle: vi.fn(),
    onSearch: vi.fn(),
    onEscape: vi.fn(),
    ...overrides,
  };
}

describe("useKeyboardNav (wired to DOM)", () => {
  it("calls onNavigate('up') on ArrowUp", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    act(() => { fireKey(container, "ArrowUp"); });

    expect(opts.onNavigate).toHaveBeenCalledWith("up");
  });

  it("calls onNavigate('down') on ArrowDown", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    act(() => { fireKey(container, "ArrowDown"); });

    expect(opts.onNavigate).toHaveBeenCalledWith("down");
  });

  it("calls onSelect on Enter", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    act(() => { fireKey(container, "Enter"); });

    expect(opts.onSelect).toHaveBeenCalledTimes(1);
  });

  it("calls onToggle on Space (when target is not input/textarea/button/select)", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    act(() => { fireKey(container, " "); });

    expect(opts.onToggle).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onToggle on Space when target is input", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const input = getByTestId("text-input");
    act(() => { fireKey(input, " "); });

    expect(opts.onToggle).not.toHaveBeenCalled();
  });

  it("does NOT call onToggle on Space when target is button", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const btn = getByTestId("btn");
    act(() => { fireKey(btn, " "); });

    expect(opts.onToggle).not.toHaveBeenCalled();
  });

  it("does NOT call onToggle on Space when target is textarea", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const ta = getByTestId("ta");
    act(() => { fireKey(ta, " "); });

    expect(opts.onToggle).not.toHaveBeenCalled();
  });

  it("does NOT call onToggle on Space when target is select", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const sel = getByTestId("sel");
    act(() => { fireKey(sel, " "); });

    expect(opts.onToggle).not.toHaveBeenCalled();
  });

  it("calls onSearch on Ctrl+K", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    act(() => { fireKey(container, "k", { ctrlKey: true }); });

    expect(opts.onSearch).toHaveBeenCalledTimes(1);
  });

  it("calls onSearch on Meta+K (Cmd+K)", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    act(() => { fireKey(container, "k", { metaKey: true }); });

    expect(opts.onSearch).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onSearch on plain 'k' press", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    act(() => { fireKey(container, "k"); });

    expect(opts.onSearch).not.toHaveBeenCalled();
  });

  it("calls onEscape on Escape", () => {
    const opts = createOptions();
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    act(() => { fireKey(container, "Escape"); });

    expect(opts.onEscape).toHaveBeenCalledTimes(1);
  });

  it("does not call handlers when enabled is false", () => {
    const opts = createOptions({ enabled: false });
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    act(() => {
      fireKey(container, "ArrowUp");
      fireKey(container, "Enter");
      fireKey(container, " ");
      fireKey(container, "Escape");
    });

    expect(opts.onNavigate).not.toHaveBeenCalled();
    expect(opts.onSelect).not.toHaveBeenCalled();
    expect(opts.onToggle).not.toHaveBeenCalled();
    expect(opts.onEscape).not.toHaveBeenCalled();
  });

  it("handles missing onEscape gracefully", () => {
    const opts = createOptions({ onEscape: undefined });
    const { getByTestId, rerender } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    // Should not throw
    act(() => { fireKey(container, "Escape"); });
  });

  it("cleans up event listener on unmount", () => {
    const opts = createOptions();
    const { getByTestId, rerender, unmount } = render(<EffectWrapper options={opts} />);
    rerender(<EffectWrapper options={opts} />);

    const container = getByTestId("container");
    unmount();

    // After unmount, events should not trigger callbacks
    act(() => { fireKey(container, "ArrowUp"); });
    expect(opts.onNavigate).not.toHaveBeenCalled();
  });
});
