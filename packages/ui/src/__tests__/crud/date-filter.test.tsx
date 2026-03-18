// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

// Mock filter-icons
vi.mock("../../crud/filters/filter-icons", () => ({
  operatorConfig: new Proxy(
    {},
    {
      get: () => ({
        icon: ({ className }: { className?: string }) => (
          <span className={className}>op</span>
        ),
        labelKey: "operator.label",
      }),
    },
  ),
}));

import { DateFilter } from "../../crud/filters/date-filter";
import { SearchOperator } from "../../crud/filters/filter-types";

describe("DateFilter", () => {
  it("renders label", () => {
    render(
      <DateFilter
        label="Created"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect(screen.getByText("Created")).toBeTruthy();
  });

  it("renders fallback label 'Pick a date' when no label", () => {
    render(
      <DateFilter
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect(screen.getByText("Pick a date")).toBeTruthy();
  });

  it("renders dashed border when no value", () => {
    const { container } = render(
      <DateFilter
        label="Date"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    const btn = container.querySelectorAll("button");
    // The popover trigger button has dashed border
    const triggerBtn = Array.from(btn).find((b) => b.className.includes("border-dashed"));
    expect(triggerBtn).toBeTruthy();
  });

  it("renders solid border when value is present", () => {
    const { container } = render(
      <DateFilter
        label="Date"
        value={new Date("2026-01-15")}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    const btn = container.querySelectorAll("button");
    const triggerBtn = Array.from(btn).find((b) => b.className.includes("border-solid"));
    expect(triggerBtn).toBeTruthy();
  });

  it("shows operator dropdown when multiple operators provided", () => {
    render(
      <DateFilter
        label="Date"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS, SearchOperator.BETWEEN]}
      />,
    );
    const opBtn = screen.getByLabelText("filter.selectOperator");
    expect(opBtn).toBeTruthy();
  });

  it("hides operator dropdown when single operator", () => {
    render(
      <DateFilter
        label="Date"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    expect(screen.queryByLabelText("filter.selectOperator")).toBeNull();
  });

  it("shows clear button (accessible) when value present", () => {
    render(
      <DateFilter
        label="Date"
        value={new Date("2026-06-01")}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    const clearBtn = screen.getByLabelText("filter.clearDate");
    expect(clearBtn).toBeTruthy();
  });

  it("hides clear button when no value (pointer-events-none)", () => {
    render(
      <DateFilter
        label="Date"
        value={undefined}
        operator={SearchOperator.EQUALS}
        onChange={vi.fn()}
        onOperatorChange={vi.fn()}
        operators={[SearchOperator.EQUALS]}
      />,
    );
    const clearBtn = screen.getByLabelText("filter.clearDate");
    expect(clearBtn.className).toContain("pointer-events-none");
  });
});
