// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("lucide-react/dynamic", () => ({
  DynamicIcon: (props: { name: string; className?: string }) =>
    React.createElement("span", {
      "data-testid": "dyn-icon",
      "data-name": props.name,
      className: props.className,
    }),
}));

import {
  GroupedToggleField,
  type GroupedToggleGroup,
} from "../../../fields/form/grouped-toggle-field";

afterEach(cleanup);

type V = string;

const groups: GroupedToggleGroup<V>[] = [
  {
    id: "image",
    label: "Image",
    icon: "image",
    options: [
      { value: "image/jpeg", label: "JPG" },
      { value: "image/png", label: "PNG" },
      { value: "image/svg+xml", label: "SVG", disabled: true },
    ],
  },
  {
    id: "doc",
    label: "Document",
    icon: "file",
    options: [
      { value: "application/pdf", label: "PDF" },
      { value: "application/msword", label: "DOC" },
    ],
  },
];

describe("GroupedToggleField", () => {
  it("TC-GTF-1: renders field label, group titles and chips", () => {
    render(
      <GroupedToggleField
        label="Allowed types"
        value={{}}
        onChange={vi.fn()}
        groups={groups}
        selectAllLabel="All"
      />,
    );
    expect(screen.getByText("Allowed types")).toBeDefined();
    expect(screen.getByRole("group", { name: "Image" })).toBeDefined();
    expect(screen.getByRole("group", { name: "Document" })).toBeDefined();
    expect(screen.getByRole("button", { name: "JPG" })).toBeDefined();
    expect(screen.getByRole("button", { name: "PDF" })).toBeDefined();
  });

  it("TC-GTF-2: toggling a chip updates only its own group array", () => {
    const onChange = vi.fn();
    render(
      <GroupedToggleField
        label="Allowed types"
        value={{ image: ["image/jpeg"], doc: ["application/pdf"] }}
        onChange={onChange}
        groups={groups}
        selectAllLabel="All"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "PNG" }));
    expect(onChange).toHaveBeenCalledWith({
      image: ["image/jpeg", "image/png"],
      doc: ["application/pdf"],
    });
  });

  it("TC-GTF-3: chip reflects pressed state via aria-pressed", () => {
    render(
      <GroupedToggleField
        label="Allowed types"
        value={{ image: ["image/jpeg"] }}
        onChange={vi.fn()}
        groups={groups}
        selectAllLabel="All"
      />,
    );
    expect(screen.getByRole("button", { name: "JPG" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "PNG" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("TC-GTF-4: select-all switch is derived — off when partial, on when full", () => {
    const { rerender } = render(
      <GroupedToggleField
        label="Allowed types"
        value={{ image: ["image/jpeg"] }}
        onChange={vi.fn()}
        groups={groups}
        selectAllLabel="All"
      />,
    );
    const imageGroup = screen.getByRole("group", { name: "Image" });
    const partialSwitch = within(imageGroup).getByRole("switch");
    expect(partialSwitch.getAttribute("aria-checked")).toBe("false");

    // Full = all enabled (non-disabled) options selected; SVG is disabled so excluded.
    rerender(
      <GroupedToggleField
        label="Allowed types"
        value={{ image: ["image/jpeg", "image/png"] }}
        onChange={vi.fn()}
        groups={groups}
        selectAllLabel="All"
      />,
    );
    const fullSwitch = within(
      screen.getByRole("group", { name: "Image" }),
    ).getByRole("switch");
    expect(fullSwitch.getAttribute("aria-checked")).toBe("true");
  });

  it("TC-GTF-5: select-all adds all enabled options, excluding disabled chips", () => {
    const onChange = vi.fn();
    render(
      <GroupedToggleField
        label="Allowed types"
        value={{ image: [] }}
        onChange={onChange}
        groups={groups}
        selectAllLabel="All"
      />,
    );
    const imageGroup = screen.getByRole("group", { name: "Image" });
    fireEvent.click(within(imageGroup).getByRole("switch"));
    // SVG (disabled) must NOT be included.
    expect(onChange).toHaveBeenCalledWith({ image: ["image/jpeg", "image/png"] });
  });

  it("TC-GTF-6: select-all preserves out-of-catalog and disabled-selected values", () => {
    const onChange = vi.fn();
    render(
      <GroupedToggleField
        label="Allowed types"
        // image/svg+xml is disabled-but-selected; image/heic is out-of-catalog.
        value={{ image: ["image/svg+xml", "image/heic"] }}
        onChange={onChange}
        groups={groups}
        selectAllLabel="All"
      />,
    );
    const imageGroup = screen.getByRole("group", { name: "Image" });
    fireEvent.click(within(imageGroup).getByRole("switch"));
    const next = onChange.mock.calls[0][0].image as string[];
    expect(next).toContain("image/svg+xml"); // disabled-selected preserved
    expect(next).toContain("image/heic"); // out-of-catalog preserved
    expect(next).toContain("image/jpeg"); // enabled added
    expect(next).toContain("image/png");
  });

  it("TC-GTF-7: turning select-all off clears enabled but keeps out-of-catalog", () => {
    const onChange = vi.fn();
    render(
      <GroupedToggleField
        label="Allowed types"
        value={{ image: ["image/jpeg", "image/png", "image/heic"] }}
        onChange={onChange}
        groups={groups}
        selectAllLabel="All"
      />,
    );
    const imageGroup = screen.getByRole("group", { name: "Image" });
    // Currently full (jpeg+png) → switch is on → click turns off.
    fireEvent.click(within(imageGroup).getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith({ image: ["image/heic"] });
  });

  it("TC-GTF-8: same value across groups is isolated", () => {
    const onChange = vi.fn();
    const permGroups: GroupedToggleGroup<V>[] = [
      { id: "Pet", label: "Pet", options: [{ value: "view", label: "View" }] },
      { id: "Order", label: "Order", options: [{ value: "view", label: "View" }] },
    ];
    render(
      <GroupedToggleField
        label="Permissions"
        value={{ Pet: ["view"], Order: [] }}
        onChange={onChange}
        groups={permGroups}
        selectAllLabel="All"
      />,
    );
    const orderGroup = screen.getByRole("group", { name: "Order" });
    fireEvent.click(within(orderGroup).getByRole("button", { name: "View" }));
    // Only Order gains "view"; Pet stays untouched.
    expect(onChange).toHaveBeenCalledWith({ Pet: ["view"], Order: ["view"] });
  });

  it("TC-GTF-9: disabled chip is not clickable", () => {
    const onChange = vi.fn();
    render(
      <GroupedToggleField
        label="Allowed types"
        value={{ image: [] }}
        onChange={onChange}
        groups={groups}
        selectAllLabel="All"
      />,
    );
    const svg = screen.getByRole("button", { name: "SVG" });
    expect(svg.hasAttribute("disabled")).toBe(true);
    fireEvent.click(svg);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("TC-GTF-10: renderOtherNote reports out-of-catalog count", () => {
    render(
      <GroupedToggleField
        label="Allowed types"
        value={{ image: ["image/jpeg", "image/heic"], doc: ["application/x-7z"] }}
        onChange={vi.fn()}
        groups={groups}
        selectAllLabel="All"
        renderOtherNote={(info) => <span>extra: {info.count}</span>}
      />,
    );
    // image/heic + application/x-7z are not in any catalog → 2.
    expect(screen.getByText("extra: 2")).toBeDefined();
  });

  it("TC-GTF-11: renderOtherNote hidden when no out-of-catalog values", () => {
    render(
      <GroupedToggleField
        label="Allowed types"
        value={{ image: ["image/jpeg"] }}
        onChange={vi.fn()}
        groups={groups}
        selectAllLabel="All"
        renderOtherNote={(info) => <span>extra: {info.count}</span>}
      />,
    );
    expect(screen.queryByText(/^extra:/)).toBeNull();
  });

  it("TC-GTF-12: hides select-all switch when showSelectAll is false", () => {
    render(
      <GroupedToggleField
        label="Allowed types"
        value={{}}
        onChange={vi.fn()}
        groups={groups}
        selectAllLabel="All"
        showSelectAll={false}
      />,
    );
    expect(screen.queryByRole("switch")).toBeNull();
  });
});
