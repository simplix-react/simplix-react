// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

import { SettingSwitch } from "../../base/controls/setting-switch";

describe("SettingSwitch", () => {
  it("renders label", () => {
    render(
      <SettingSwitch label="Dark Mode" checked={false} onCheckedChange={vi.fn()} />,
    );
    expect(screen.getByText("Dark Mode")).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(
      <SettingSwitch
        label="Notifications"
        description="Enable email notifications"
        checked={false}
        onCheckedChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Enable email notifications")).toBeTruthy();
  });

  it("does not render description when not provided", () => {
    const { container } = render(
      <SettingSwitch label="Test" checked={false} onCheckedChange={vi.fn()} />,
    );
    expect(container.querySelector("p")).toBeNull();
  });

  it("renders switch in checked state", () => {
    render(
      <SettingSwitch label="Enabled" checked={true} onCheckedChange={vi.fn()} />,
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl.getAttribute("data-state")).toBe("checked");
  });

  it("renders switch in unchecked state", () => {
    render(
      <SettingSwitch label="Disabled" checked={false} onCheckedChange={vi.fn()} />,
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl.getAttribute("data-state")).toBe("unchecked");
  });

  it("calls onCheckedChange when switch is toggled", () => {
    const onCheckedChange = vi.fn();
    render(
      <SettingSwitch label="Test" checked={false} onCheckedChange={onCheckedChange} />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders disabled switch", () => {
    render(
      <SettingSwitch label="Test" checked={false} onCheckedChange={vi.fn()} disabled />,
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveProperty("disabled", true);
  });

  it("uses custom id when provided", () => {
    render(
      <SettingSwitch label="Test" checked={false} onCheckedChange={vi.fn()} id="custom-id" />,
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl.id).toBe("custom-id");
  });

  it("label is clickable via htmlFor", () => {
    render(
      <SettingSwitch label="Clickable" checked={false} onCheckedChange={vi.fn()} id="sw-1" />,
    );
    const label = screen.getByText("Clickable");
    expect(label.closest("label")?.getAttribute("for")).toBe("sw-1");
  });
});
