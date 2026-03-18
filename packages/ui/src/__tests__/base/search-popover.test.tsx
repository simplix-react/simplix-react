// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "field.searchOption": "Search...",
        "field.noResults": "No results found",
      };
      return map[key] ?? key;
    },
    locale: "en",
    exists: () => false,
  }),
}));

import { SearchPopover } from "../../base/inputs/search-popover";

afterEach(cleanup);

describe("SearchPopover", () => {
  const items = [
    { id: "1", name: "Alpha" },
    { id: "2", name: "Beta" },
    { id: "3", name: "Gamma" },
  ];

  const getLabel = (item: { id: string; name: string }) => item.name;
  const getKey = (item: { id: string; name: string }) => item.id;

  it("renders trigger button with text", () => {
    render(
      <SearchPopover
        triggerText="Add Item"
        items={items}
        getLabel={getLabel}
        getKey={getKey}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("Add Item")).toBeDefined();
  });

  it("renders with sm size and outline variant", () => {
    render(
      <SearchPopover
        triggerText="Add"
        items={items}
        getLabel={getLabel}
        getKey={getKey}
        onSelect={vi.fn()}
      />,
    );
    const btn = screen.getByText("Add").closest("button") as HTMLButtonElement;
    expect(btn.className).toContain("h-8"); // sm size
  });

  it("renders PlusIcon in trigger", () => {
    const { container } = render(
      <SearchPopover
        triggerText="Add"
        items={items}
        getLabel={getLabel}
        getKey={getKey}
        onSelect={vi.fn()}
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("supports disabled state", () => {
    render(
      <SearchPopover
        triggerText="Add"
        items={items}
        getLabel={getLabel}
        getKey={getKey}
        onSelect={vi.fn()}
        disabled
      />,
    );
    const btn = screen.getByText("Add").closest("button") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("shows disabled reason as title when disabled", () => {
    render(
      <SearchPopover
        triggerText="Add"
        items={items}
        getLabel={getLabel}
        getKey={getKey}
        onSelect={vi.fn()}
        disabled
        disabledReason="Max reached"
      />,
    );
    const btn = screen.getByText("Add").closest("button") as HTMLButtonElement;
    expect(btn.getAttribute("title")).toBe("Max reached");
  });

  it("opens popover and shows items on click (pointer)", () => {
    render(
      <SearchPopover
        triggerText="Add"
        items={items}
        getLabel={getLabel}
        getKey={getKey}
        onSelect={vi.fn()}
      />,
    );
    const btn = screen.getByText("Add").closest("button")!;
    fireEvent.pointerDown(btn, { pointerType: "mouse" });
    fireEvent.pointerUp(btn, { pointerType: "mouse" });
    fireEvent.click(btn);
    // Popover renders in portal, search the entire document
    const alpha = document.body.querySelector("[cmdk-item]");
    expect(alpha).not.toBeNull();
  });

  it("shows search input with placeholder", () => {
    render(
      <SearchPopover
        triggerText="Add"
        items={items}
        getLabel={getLabel}
        getKey={getKey}
        onSelect={vi.fn()}
      />,
    );
    const btn = screen.getByText("Add").closest("button")!;
    fireEvent.pointerDown(btn, { pointerType: "mouse" });
    fireEvent.pointerUp(btn, { pointerType: "mouse" });
    fireEvent.click(btn);
    const input = document.body.querySelector("[cmdk-input]");
    expect(input).not.toBeNull();
  });

  it("uses custom placeholder", () => {
    render(
      <SearchPopover
        triggerText="Add"
        items={items}
        getLabel={getLabel}
        getKey={getKey}
        onSelect={vi.fn()}
        placeholder="Find items..."
      />,
    );
    const btn = screen.getByText("Add").closest("button")!;
    fireEvent.pointerDown(btn, { pointerType: "mouse" });
    fireEvent.pointerUp(btn, { pointerType: "mouse" });
    fireEvent.click(btn);
    const input = document.body.querySelector("[cmdk-input]") as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input!.placeholder).toBe("Find items...");
  });

  it("calls onSelect when item is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SearchPopover
        triggerText="Add"
        items={items}
        getLabel={getLabel}
        getKey={getKey}
        onSelect={onSelect}
      />,
    );
    const btn = screen.getByText("Add").closest("button")!;
    fireEvent.pointerDown(btn, { pointerType: "mouse" });
    fireEvent.pointerUp(btn, { pointerType: "mouse" });
    fireEvent.click(btn);
    const cmdItems = document.body.querySelectorAll("[cmdk-item]");
    expect(cmdItems.length).toBe(3);
    // Click "Beta" item
    fireEvent.click(cmdItems[1]);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  it("renders grouped items", () => {
    const groups = [
      { label: "Group A", items: [{ id: "1", name: "A1" }] },
      { label: "Group B", items: [{ id: "2", name: "B1" }] },
    ];
    render(
      <SearchPopover
        triggerText="Add"
        groups={groups}
        getLabel={getLabel}
        getKey={getKey}
        onSelect={vi.fn()}
      />,
    );
    const btn = screen.getByText("Add").closest("button")!;
    fireEvent.pointerDown(btn, { pointerType: "mouse" });
    fireEvent.pointerUp(btn, { pointerType: "mouse" });
    fireEvent.click(btn);
    const cmdGroups = document.body.querySelectorAll("[cmdk-group]");
    expect(cmdGroups.length).toBeGreaterThanOrEqual(2);
  });
});
