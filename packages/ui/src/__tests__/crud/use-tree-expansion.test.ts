// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useTreeExpansion } from "../../crud/tree/use-tree-expansion";
import type { TreeConfig } from "../../crud/tree/tree-types";

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

const config: TreeConfig<TreeNode> = {
  idField: "id",
  childrenField: "children",
};

const sampleTree: TreeNode[] = [
  {
    id: "A",
    name: "Node A",
    children: [
      {
        id: "B",
        name: "Node B",
        children: [
          { id: "D", name: "Node D", children: [] },
        ],
      },
      {
        id: "C",
        name: "Node C",
        children: [],
      },
    ],
  },
];

describe("useTreeExpansion", () => {
  it("initializes with depth 1 expanded by default", () => {
    const { result } = renderHook(() =>
      useTreeExpansion({ data: sampleTree, config }),
    );
    // Default initialExpandedDepth is 1, so root parent "A" is expanded
    expect(result.current.isExpanded("A")).toBe(true);
    expect(result.current.isExpanded("B")).toBe(false);
  });

  it("respects initialExpandedDepth from config", () => {
    const configWith2 = { ...config, initialExpandedDepth: 2 };
    const { result } = renderHook(() =>
      useTreeExpansion({ data: sampleTree, config: configWith2 }),
    );
    expect(result.current.isExpanded("A")).toBe(true);
    expect(result.current.isExpanded("B")).toBe(true);
  });

  it("toggleExpand adds and removes node from expanded set", () => {
    const { result } = renderHook(() =>
      useTreeExpansion({ data: sampleTree, config }),
    );

    // B is not expanded initially
    expect(result.current.isExpanded("B")).toBe(false);

    act(() => result.current.toggleExpand("B"));
    expect(result.current.isExpanded("B")).toBe(true);

    act(() => result.current.toggleExpand("B"));
    expect(result.current.isExpanded("B")).toBe(false);
  });

  it("expandAll expands all nodes", () => {
    const { result } = renderHook(() =>
      useTreeExpansion({ data: sampleTree, config }),
    );

    act(() => result.current.expandAll());
    expect(result.current.isExpanded("A")).toBe(true);
    expect(result.current.isExpanded("B")).toBe(true);
    // Leaf nodes are also in the set (they just have no children to show)
    expect(result.current.expandedIds.has("D")).toBe(true);
  });

  it("collapseAll empties the expanded set", () => {
    const { result } = renderHook(() =>
      useTreeExpansion({ data: sampleTree, config }),
    );

    act(() => result.current.expandAll());
    act(() => result.current.collapseAll());
    expect(result.current.expandedIds.size).toBe(0);
  });

  it("expandToNode expands ancestor nodes", () => {
    const configWith0 = { ...config, initialExpandedDepth: 0 };
    const { result } = renderHook(() =>
      useTreeExpansion({ data: sampleTree, config: configWith0 }),
    );

    // Nothing expanded initially
    expect(result.current.expandedIds.size).toBe(0);

    // Expand to reveal node D (ancestors: A, B)
    act(() => result.current.expandToNode("D"));
    expect(result.current.isExpanded("A")).toBe(true);
    expect(result.current.isExpanded("B")).toBe(true);
  });

  it("expandToNode does nothing for root node", () => {
    const configWith0 = { ...config, initialExpandedDepth: 0 };
    const { result } = renderHook(() =>
      useTreeExpansion({ data: sampleTree, config: configWith0 }),
    );

    act(() => result.current.expandToNode("A"));
    // No ancestors to expand, so size stays 0
    expect(result.current.expandedIds.size).toBe(0);
  });
});
