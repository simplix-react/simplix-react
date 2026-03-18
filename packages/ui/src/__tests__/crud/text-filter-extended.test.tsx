// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import { TextFilter } from "../../crud/filters/text-filter";

describe("TextFilter (extended coverage)", () => {
  it("applies custom className", () => {
    const { container } = render(
      <TextFilter label="Search" value="" onChange={vi.fn()} className="my-filter" />,
    );
    expect(container.firstElementChild?.className).toContain("my-filter");
  });

  it("renders magnifying glass icon", () => {
    const { container } = render(
      <TextFilter label="Search" value="" onChange={vi.fn()} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("multiple rapid changes call onChange each time", () => {
    const onChange = vi.fn();
    render(
      <TextFilter label="Search" value="" onChange={onChange} />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith("abc");
  });
});
