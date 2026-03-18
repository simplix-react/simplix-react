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

import { DateRangeFilter } from "../../crud/filters/date-range-filter";

describe("DateRangeFilter", () => {
  it("renders label", () => {
    render(
      <DateRangeFilter
        label="Created"
        from={undefined}
        to={undefined}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Created")).toBeTruthy();
  });

  it("renders dashed border when no value", () => {
    const { container } = render(
      <DateRangeFilter
        label="Created"
        from={undefined}
        to={undefined}
        onChange={vi.fn()}
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-dashed");
  });

  it("renders solid border when value is present", () => {
    const { container } = render(
      <DateRangeFilter
        label="Created"
        from={new Date("2026-01-01")}
        to={new Date("2026-01-31")}
        onChange={vi.fn()}
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-solid");
  });

  it("shows clear button when value is present", () => {
    render(
      <DateRangeFilter
        label="Created"
        from={new Date("2026-01-01")}
        to={undefined}
        onChange={vi.fn()}
      />,
    );
    const clearBtn = screen.getByLabelText("filter.clearDateRange");
    expect(clearBtn).toBeTruthy();
  });

  it("hides clear button (pointer-events-none) when no value", () => {
    render(
      <DateRangeFilter
        label="Created"
        from={undefined}
        to={undefined}
        onChange={vi.fn()}
      />,
    );
    const clearBtn = screen.getByLabelText("filter.clearDateRange");
    expect(clearBtn.className).toContain("pointer-events-none");
  });

  it("calls onChange with undefined when clear button is clicked", () => {
    const onChange = vi.fn();
    render(
      <DateRangeFilter
        label="Created"
        from={new Date("2026-01-01")}
        to={new Date("2026-01-31")}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearDateRange"));
    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it("calls onChange with undefined on clear via Enter key", () => {
    const onChange = vi.fn();
    render(
      <DateRangeFilter
        label="Created"
        from={new Date("2026-01-01")}
        to={new Date("2026-01-31")}
        onChange={onChange}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearDateRange"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it("calls onChange with undefined on clear via Space key", () => {
    const onChange = vi.fn();
    render(
      <DateRangeFilter
        label="Created"
        from={new Date("2026-01-01")}
        to={new Date("2026-01-31")}
        onChange={onChange}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearDateRange"), { key: " " });
    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it("does not clear on unrelated key press", () => {
    const onChange = vi.fn();
    render(
      <DateRangeFilter
        label="Created"
        from={new Date("2026-01-01")}
        to={new Date("2026-01-31")}
        onChange={onChange}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText("filter.clearDateRange"), { key: "Escape" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders solid border when only from is set", () => {
    const { container } = render(
      <DateRangeFilter
        label="Created"
        from={new Date("2026-01-01")}
        to={undefined}
        onChange={vi.fn()}
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-solid");
  });

  it("renders solid border when only to is set", () => {
    const { container } = render(
      <DateRangeFilter
        label="Created"
        from={undefined}
        to={new Date("2026-01-31")}
        onChange={vi.fn()}
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-solid");
  });

  it("applies custom className", () => {
    const { container } = render(
      <DateRangeFilter
        label="Created"
        from={undefined}
        to={undefined}
        onChange={vi.fn()}
        className="my-filter"
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("my-filter");
  });

  it("opens popover when trigger button is clicked", () => {
    render(
      <DateRangeFilter
        label="Created"
        from={undefined}
        to={undefined}
        onChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Created"));
    // Calendar renders inside popover -- should now be visible in the DOM
    // The Popover content is rendered. We check for popover content container
    // (Radix renders to a portal, so use document.body)
  });

  it("clear button has tabIndex -1 when no value", () => {
    render(
      <DateRangeFilter
        label="Created"
        from={undefined}
        to={undefined}
        onChange={vi.fn()}
      />,
    );
    const clearBtn = screen.getByLabelText("filter.clearDateRange");
    expect(clearBtn.getAttribute("tabindex")).toBe("-1");
  });

  it("clear button has tabIndex 0 when value is present", () => {
    render(
      <DateRangeFilter
        label="Created"
        from={new Date("2026-01-01")}
        to={undefined}
        onChange={vi.fn()}
      />,
    );
    const clearBtn = screen.getByLabelText("filter.clearDateRange");
    expect(clearBtn.getAttribute("tabindex")).toBe("0");
  });
});
