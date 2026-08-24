// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TreeMultiSelectField } from "../../../fields/form/tree-multi-select-field";

afterEach(cleanup);

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const TREE: Node[] = [
  {
    id: "b1",
    name: "본관",
    children: [
      { id: "f1", name: "지하 1층" },
      { id: "f2", name: "1층" },
      { id: "f3", name: "2층" },
    ],
  },
  { id: "b2", name: "별관", children: [{ id: "f4", name: "1층" }] },
];

function Cascade({ initial = [] as string[], maxCount }: { initial?: string[]; maxCount?: number }) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <>
      <TreeMultiSelectField<Node>
        label="층"
        value={value}
        onChange={setValue}
        treeData={TREE}
        selectionMode="leaf-cascade"
        maxCount={maxCount}
        getDisplayName={(n) => n.name}
        getChipLabel={(n) => (n.children ? n.name : `본관 ${n.name}`)}
      />
      <output data-testid="value">{value.join(",")}</output>
    </>
  );
}

function NodeMode() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <>
      <TreeMultiSelectField<Node>
        label="조직"
        value={value}
        onChange={setValue}
        treeData={TREE}
        getDisplayName={(n) => n.name}
      />
      <output data-testid="value">{value.join(",")}</output>
    </>
  );
}

/** Opens the popover from the field's chevron trigger. */
function openTree() {
  fireEvent.click(screen.getByRole("combobox"));
}

/** Expands every collapsed branch so its leaves render. */
function expandAll() {
  screen.getAllByRole("button", { name: "Expand" }).forEach((b) => fireEvent.click(b));
}

function value() {
  return screen.getByTestId("value").textContent;
}

describe("TreeMultiSelectField · leaf-cascade", () => {
  it("checking a branch selects every leaf beneath it and never the branch id", () => {
    render(<Cascade />);
    openTree();
    fireEvent.click(screen.getByRole("checkbox", { name: "본관" }));
    expect(value()).toBe("f1,f2,f3");
  });

  it("unchecking a branch clears only its own leaves", () => {
    render(<Cascade initial={["f1", "f2", "f3", "f4"]} />);
    openTree();
    fireEvent.click(screen.getByRole("checkbox", { name: "본관" }));
    expect(value()).toBe("f4");
  });

  it("a partly selected branch renders indeterminate", () => {
    render(<Cascade initial={["f2"]} />);
    openTree();
    expect(screen.getByRole("checkbox", { name: "본관" }).getAttribute("data-state"))
      .toBe("indeterminate");
  });

  it("a fully selected branch renders checked", () => {
    render(<Cascade initial={["f1", "f2", "f3"]} />);
    openTree();
    expect(screen.getByRole("checkbox", { name: "본관" }).getAttribute("data-state"))
      .toBe("checked");
  });

  it("a leaf toggles on its own", () => {
    render(<Cascade initial={["f2"]} />);
    openTree();
    expandAll();
    fireEvent.click(screen.getByRole("checkbox", { name: "2층" }));
    expect(value()).toBe("f2,f3");
  });

  it("a fully selected branch collapses to one chip whose remove clears all its leaves", () => {
    render(<Cascade initial={["f1", "f2", "f3"]} />);
    const chips = screen.getAllByTestId("tree-chip");
    expect(chips).toHaveLength(1);
    expect(chips[0].textContent).toContain("본관");
    fireEvent.click(within(chips[0]).getByRole("button"));
    expect(value()).toBe("");
  });

  it("a partly selected branch renders one chip per selected leaf", () => {
    render(<Cascade initial={["f2"]} />);
    const chips = screen.getAllByTestId("tree-chip");
    expect(chips).toHaveLength(1);
    expect(chips[0].textContent).toContain("본관 1층");
  });

  it("a branch that would overrun maxCount applies none of its leaves", () => {
    render(<Cascade maxCount={2} />);
    openTree();
    fireEvent.click(screen.getByRole("checkbox", { name: "본관" }));
    expect(value()).toBe("");
  });
});

describe("TreeMultiSelectField · node (default)", () => {
  it("selects the node itself, branch included", () => {
    render(<NodeMode />);
    openTree();
    fireEvent.click(screen.getByText("본관"));
    expect(value()).toBe("b1");
  });

  it("renders no checkbox", () => {
    render(<NodeMode />);
    openTree();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });
});
