// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

vi.mock("../../utils/use-country-options", () => ({
  useCountryOptions: () => [
    {
      code: "US",
      localName: "United States",
      englishName: "United States of America",
      Flag: ({ className }: { className?: string }) => <span className={className}>US-flag</span>,
    },
    {
      code: "KR",
      localName: "South Korea",
      englishName: "Republic of Korea",
      Flag: ({ className }: { className?: string }) => <span className={className}>KR-flag</span>,
    },
  ],
}));

vi.mock("../../utils/timezone-country-map", () => ({
  countryFromTimezone: (tz: string) => (tz === "Asia/Seoul" ? "KR" : undefined),
}));

import { CountryField } from "../../fields/form/country-field";

afterEach(cleanup);

describe("CountryField filterFn", () => {
  it("matches by country code", () => {
    render(<CountryField label="Country" value="" onChange={vi.fn()} />);
    const fieldset = screen.getByTestId("form-field-country");
    fireEvent.click(fieldset.querySelector("button")!);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "us" } });
    expect(screen.getByText("United States")).toBeTruthy();
  });

  it("matches by localName", () => {
    render(<CountryField label="Country" value="" onChange={vi.fn()} />);
    const fieldset = screen.getByTestId("form-field-country");
    fireEvent.click(fieldset.querySelector("button")!);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "south" } });
    expect(screen.getByText("South Korea")).toBeTruthy();
  });

  it("matches by englishName", () => {
    render(<CountryField label="Country" value="" onChange={vi.fn()} />);
    const fieldset = screen.getByTestId("form-field-country");
    fireEvent.click(fieldset.querySelector("button")!);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "republic" } });
    expect(screen.getByText("South Korea")).toBeTruthy();
  });

  it("returns 0 for non-matching search", () => {
    render(<CountryField label="Country" value="" onChange={vi.fn()} />);
    const fieldset = screen.getByTestId("form-field-country");
    fireEvent.click(fieldset.querySelector("button")!);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "zzzzzzz" } });
    expect(screen.getByText("filter.noResultsFound")).toBeTruthy();
  });
});

describe("CountryField handleSelect", () => {
  it("deselects when same country is selected again", () => {
    const onChange = vi.fn();
    render(<CountryField label="Country" value="US" onChange={onChange} />);
    const fieldset = screen.getByTestId("form-field-country");
    fireEvent.click(fieldset.querySelector("button")!);
    // When value="US", trigger shows "United States" and dropdown also has it
    const matches = screen.getAllByText("United States");
    fireEvent.click(matches[matches.length - 1]);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("selects a new country", () => {
    const onChange = vi.fn();
    render(<CountryField label="Country" value="US" onChange={onChange} />);
    const fieldset = screen.getByTestId("form-field-country");
    fireEvent.click(fieldset.querySelector("button")!);
    fireEvent.click(screen.getByText("South Korea"));
    expect(onChange).toHaveBeenCalledWith("KR");
  });
});

describe("CountryField handleClear", () => {
  it("clears via X button click", () => {
    const onChange = vi.fn();
    render(<CountryField label="Country" value="US" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("field.clear"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("clears via Enter keydown on clear button", () => {
    const onChange = vi.fn();
    render(<CountryField label="Country" value="KR" onChange={onChange} />);
    fireEvent.keyDown(screen.getByLabelText("field.clear"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("");
  });
});

describe("CountryField handleDetect", () => {
  it("detects country from browser timezone", () => {
    const onChange = vi.fn();
    vi.spyOn(Intl, "DateTimeFormat").mockReturnValue({
      resolvedOptions: () => ({ timeZone: "Asia/Seoul" }),
    } as unknown as Intl.DateTimeFormat);
    render(<CountryField label="Country" value="" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("field.detectCountry"));
    expect(onChange).toHaveBeenCalledWith("KR");
    vi.restoreAllMocks();
  });

  it("does nothing when no country for timezone", () => {
    const onChange = vi.fn();
    vi.spyOn(Intl, "DateTimeFormat").mockReturnValue({
      resolvedOptions: () => ({ timeZone: "Etc/UTC" }),
    } as unknown as Intl.DateTimeFormat);
    render(<CountryField label="Country" value="" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("field.detectCountry"));
    expect(onChange).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("handles detection error gracefully", () => {
    const onChange = vi.fn();
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => { throw new Error("fail"); });
    render(<CountryField label="Country" value="" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("field.detectCountry"));
    expect(onChange).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("hides detect button when disabled", () => {
    render(<CountryField label="Country" value="" onChange={vi.fn()} disabled />);
    expect(screen.queryByLabelText("field.detectCountry")).toBeNull();
  });
});
