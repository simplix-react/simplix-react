// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
  useLocale: () => "en",
}));

import { TimezoneField } from "../../fields/form/timezone-field";

afterEach(cleanup);

describe("TimezoneField filterFn", () => {
  it("matches by timezone value (IANA ID)", () => {
    render(<TimezoneField label="Timezone" value="" onChange={vi.fn()} />);
    const fieldset = screen.getByTestId("form-field-timezone");
    fireEvent.click(fieldset.querySelector("button")!);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Asia" } });
    expect(input).toBeTruthy();
  });

  it("shows no results for non-matching search", () => {
    render(<TimezoneField label="Timezone" value="" onChange={vi.fn()} />);
    const fieldset = screen.getByTestId("form-field-timezone");
    fireEvent.click(fieldset.querySelector("button")!);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "zzzzzzzzz" } });
    expect(screen.getByText("filter.noResultsFound")).toBeTruthy();
  });
});

describe("TimezoneField handleClear", () => {
  it("clears via X button click", () => {
    const onChange = vi.fn();
    render(<TimezoneField label="Timezone" value="Asia/Seoul" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("field.clear"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("clears via Enter keydown on clear button", () => {
    const onChange = vi.fn();
    render(<TimezoneField label="Timezone" value="Asia/Seoul" onChange={onChange} />);
    fireEvent.keyDown(screen.getByLabelText("field.clear"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("");
  });
});

describe("TimezoneField handleDetect", () => {
  it("detects timezone from browser", () => {
    const onChange = vi.fn();
    vi.spyOn(Intl, "DateTimeFormat").mockReturnValue({
      resolvedOptions: () => ({ timeZone: "America/New_York" }),
    } as unknown as Intl.DateTimeFormat);
    render(<TimezoneField label="Timezone" value="" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("field.detectTimezone"));
    expect(onChange).toHaveBeenCalledWith("America/New_York");
    vi.restoreAllMocks();
  });

  it("handles detection error gracefully", () => {
    const onChange = vi.fn();
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => { throw new Error("fail"); });
    render(<TimezoneField label="Timezone" value="" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("field.detectTimezone"));
    expect(onChange).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("hides detect button when disabled", () => {
    render(<TimezoneField label="Timezone" value="" onChange={vi.fn()} disabled />);
    expect(screen.queryByLabelText("field.detectTimezone")).toBeNull();
  });
});
