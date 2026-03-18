// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.count !== undefined) return `${opts.count} selected`;
      return key;
    },
    locale: "en",
    exists: () => true,
  }),
}));

import { FacetedFilter, type FacetedFilterOption } from "../../crud/filters/faceted-filter";

const options: FacetedFilterOption[] = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

describe("FacetedFilter", () => {
  it("renders label", () => {
    render(
      <FacetedFilter
        label="Status"
        value={[]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    expect(screen.getByText("Status")).toBeTruthy();
  });

  it("renders dashed border when no selection", () => {
    const { container } = render(
      <FacetedFilter
        label="Status"
        value={[]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-dashed");
  });

  it("renders solid border when selection exists", () => {
    const { container } = render(
      <FacetedFilter
        label="Status"
        value={["active"]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-solid");
  });

  it("shows clear button when selection exists", () => {
    render(
      <FacetedFilter
        label="Status"
        value={["active"]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    expect(screen.getByLabelText("filter.clearFilter")).toBeTruthy();
  });

  it("does not show clear button when no selection", () => {
    render(
      <FacetedFilter
        label="Status"
        value={[]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    expect(screen.queryByLabelText("filter.clearFilter")).toBeNull();
  });

  it("renders with single string value", () => {
    const { container } = render(
      <FacetedFilter
        label="Status"
        value="active"
        onChange={vi.fn()}
        options={options}
        multiSelect={false}
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("border-solid");
  });

  it("shows count badge when many selections exceed maxDisplayCount", () => {
    render(
      <FacetedFilter
        label="Status"
        value={["active", "draft", "archived", "pending1", "pending2", "pending3"]}
        onChange={vi.fn()}
        options={[
          ...options,
          { value: "pending1", label: "Pending 1" },
          { value: "pending2", label: "Pending 2" },
          { value: "pending3", label: "Pending 3" },
        ]}
        maxDisplayCount={2}
      />,
    );
    expect(screen.getByText("6 selected")).toBeTruthy();
  });
});
