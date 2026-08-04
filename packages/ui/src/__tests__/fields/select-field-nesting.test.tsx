// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ComboboxField } from "../../fields/form/combobox-field";
import { CountryField } from "../../fields/form/country-field";
import { CurrencyField } from "../../fields/form/currency-field";
import { MultiSelectField } from "../../fields/form/multi-select-field";
import { TimezoneField } from "../../fields/form/timezone-field";
import { TreeMultiSelectField } from "../../fields/form/tree-multi-select-field";
import { TreeSelectField } from "../../fields/form/tree-select-field";

afterEach(cleanup);

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

const treeData: TreeNode[] = [
  { id: "1", name: "Root A", children: [{ id: "1-1", name: "Child A1", children: [] }] },
];

const options = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
];

// Every field is rendered WITH a value, the state that used to put a clear /
// remove button inside the popover trigger.
const cases: Array<[string, () => React.ReactElement]> = [
  [
    "ComboboxField",
    () => (
      <ComboboxField label="Fruit" value="apple" onChange={vi.fn()} options={options} onExpand={vi.fn()} />
    ),
  ],
  [
    "MultiSelectField",
    () => <MultiSelectField label="Tags" value={["apple"]} onChange={vi.fn()} options={options} />,
  ],
  [
    "TreeSelectField",
    () => <TreeSelectField label="Category" value="1" onChange={vi.fn()} treeData={treeData} />,
  ],
  [
    "TreeMultiSelectField",
    () => <TreeMultiSelectField label="Categories" value={["1"]} onChange={vi.fn()} treeData={treeData} />,
  ],
  ["CountryField", () => <CountryField label="Country" value="US" onChange={vi.fn()} />],
  ["CurrencyField", () => <CurrencyField label="Currency" value="USD" onChange={vi.fn()} />],
  ["TimezoneField", () => <TimezoneField label="Timezone" value="UTC" onChange={vi.fn()} />],
];

describe("popover-backed select fields", () => {
  it.each(cases)("%s puts no control inside its combobox", (_name, renderField) => {
    render(renderField());
    const combobox = screen.getByRole("combobox");
    expect(["BUTTON", "INPUT"]).toContain(combobox.tagName);
    expect(combobox.querySelectorAll("button, a, input, select, textarea")).toHaveLength(0);
  });

  it.each(cases)("%s keeps its trailing controls reachable by keyboard", (_name, renderField) => {
    render(renderField());
    const focusable = document.querySelectorAll<HTMLElement>(
      "fieldset button:not([disabled]), fieldset input:not([disabled])",
    );
    // The combobox plus at least one trailing affordance (clear / remove chip).
    expect(focusable.length).toBeGreaterThanOrEqual(2);
    expect([...focusable].every((el) => el.tabIndex >= 0)).toBe(true);
  });
});
