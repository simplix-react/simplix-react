import { describe, expect, it } from "vitest";

import {
  treeToFlat,
  getAllNodeIds,
  getNodeIdsUpToDepth,
  getDescendantIds,
  getAncestorIds,
  getSiblings,
  filterTreeWithAncestors,
} from "../../crud/tree/tree-utils";
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

// Sample tree:
//   A
//   ├── B
//   │   ├── D
//   │   └── E
//   └── C
//       └── F
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
          { id: "E", name: "Node E", children: [] },
        ],
      },
      {
        id: "C",
        name: "Node C",
        children: [
          { id: "F", name: "Node F", children: [] },
        ],
      },
    ],
  },
];

describe("treeToFlat", () => {
  it("flattens root nodes only when nothing is expanded", () => {
    const flat = treeToFlat(sampleTree, new Set(), config);
    expect(flat).toHaveLength(1);
    expect(flat[0].id).toBe("A");
    expect(flat[0]._treeDepth).toBe(0);
    expect(flat[0]._hasChildren).toBe(true);
    expect(flat[0]._isExpanded).toBe(false);
  });

  it("includes children of expanded nodes", () => {
    const flat = treeToFlat(sampleTree, new Set(["A"]), config);
    expect(flat).toHaveLength(3);
    expect(flat.map((n) => n.id)).toEqual(["A", "B", "C"]);
    expect(flat[1]._treeDepth).toBe(1);
    expect(flat[2]._treeDepth).toBe(1);
  });

  it("recursively expands multiple levels", () => {
    const flat = treeToFlat(sampleTree, new Set(["A", "B"]), config);
    expect(flat.map((n) => n.id)).toEqual(["A", "B", "D", "E", "C"]);
    expect(flat[2]._treeDepth).toBe(2);
    expect(flat[2]._hasChildren).toBe(false);
  });

  it("marks expanded nodes correctly", () => {
    const flat = treeToFlat(sampleTree, new Set(["A"]), config);
    expect(flat[0]._isExpanded).toBe(true);
    expect(flat[1]._isExpanded).toBe(false);
  });

  it("marks loading nodes when loadingIds is provided", () => {
    const flat = treeToFlat(sampleTree, new Set(["A"]), config, new Set(["B"]));
    const nodeB = flat.find((n) => n.id === "B")!;
    expect(nodeB._isLoading).toBe(true);
    const nodeA = flat.find((n) => n.id === "A")!;
    expect(nodeA._isLoading).toBe(false);
  });

  it("handles empty data", () => {
    expect(treeToFlat([], new Set(), config)).toEqual([]);
  });
});

describe("getAllNodeIds", () => {
  it("returns all node IDs in the tree", () => {
    const ids = getAllNodeIds(sampleTree, config);
    expect(ids.sort()).toEqual(["A", "B", "C", "D", "E", "F"]);
  });

  it("returns empty array for empty data", () => {
    expect(getAllNodeIds([], config)).toEqual([]);
  });
});

describe("getNodeIdsUpToDepth", () => {
  it("returns root parent IDs at depth 1", () => {
    const ids = getNodeIdsUpToDepth(sampleTree, 1, config);
    expect(ids).toEqual(["A"]);
  });

  it("returns parent IDs up to depth 2", () => {
    const ids = getNodeIdsUpToDepth(sampleTree, 2, config);
    expect(ids.sort()).toEqual(["A", "B", "C"]);
  });

  it("returns empty at depth 0", () => {
    expect(getNodeIdsUpToDepth(sampleTree, 0, config)).toEqual([]);
  });

  it("skips leaf nodes", () => {
    // D, E, F have no children and should never appear
    const ids = getNodeIdsUpToDepth(sampleTree, 10, config);
    expect(ids).not.toContain("D");
    expect(ids).not.toContain("E");
    expect(ids).not.toContain("F");
  });
});

describe("getDescendantIds", () => {
  it("returns all descendants of a node", () => {
    const ids = getDescendantIds(sampleTree, "A", config);
    expect(ids).toEqual(new Set(["B", "C", "D", "E", "F"]));
  });

  it("returns children of an intermediate node", () => {
    const ids = getDescendantIds(sampleTree, "B", config);
    expect(ids).toEqual(new Set(["D", "E"]));
  });

  it("returns empty set for a leaf node", () => {
    const ids = getDescendantIds(sampleTree, "D", config);
    expect(ids.size).toBe(0);
  });

  it("returns empty set for non-existent node", () => {
    const ids = getDescendantIds(sampleTree, "Z", config);
    expect(ids.size).toBe(0);
  });
});

describe("getAncestorIds", () => {
  it("returns ancestors for a deeply nested node", () => {
    const ancestors = getAncestorIds(sampleTree, "D", config);
    expect(ancestors).toEqual(["A", "B"]);
  });

  it("returns root ancestor for depth-1 node", () => {
    const ancestors = getAncestorIds(sampleTree, "B", config);
    expect(ancestors).toEqual(["A"]);
  });

  it("returns empty array for root node", () => {
    const ancestors = getAncestorIds(sampleTree, "A", config);
    expect(ancestors).toEqual([]);
  });

  it("returns empty array for non-existent node", () => {
    expect(getAncestorIds(sampleTree, "Z", config)).toEqual([]);
  });
});

describe("getSiblings", () => {
  it("returns root nodes when parentId is null", () => {
    const siblings = getSiblings(sampleTree, null, config);
    expect(siblings).toEqual(sampleTree);
  });

  it("returns children of the given parent", () => {
    const siblings = getSiblings(sampleTree, "A", config);
    expect(siblings.map((s) => s.id)).toEqual(["B", "C"]);
  });

  it("returns children of a nested parent", () => {
    const siblings = getSiblings(sampleTree, "B", config);
    expect(siblings.map((s) => s.id)).toEqual(["D", "E"]);
  });

  it("returns empty array for non-existent parent", () => {
    expect(getSiblings(sampleTree, "Z", config)).toEqual([]);
  });

  it("returns empty array for leaf parent", () => {
    expect(getSiblings(sampleTree, "D", config)).toEqual([]);
  });
});

describe("filterTreeWithAncestors", () => {
  it("returns matching nodes and their ancestors", () => {
    const result = filterTreeWithAncestors(
      sampleTree,
      (item) => item.id === "D",
      config,
    );
    // A -> B -> D should be preserved
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("A");
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].id).toBe("B");
    expect(result[0].children[0].children).toHaveLength(1);
    expect(result[0].children[0].children[0].id).toBe("D");
  });

  it("returns multiple branches when multiple nodes match", () => {
    const result = filterTreeWithAncestors(
      sampleTree,
      (item) => item.id === "D" || item.id === "F",
      config,
    );
    // A should have both B (with D) and C (with F)
    expect(result[0].children).toHaveLength(2);
  });

  it("returns empty when nothing matches", () => {
    const result = filterTreeWithAncestors(
      sampleTree,
      () => false,
      config,
    );
    expect(result).toEqual([]);
  });

  it("returns the full tree when root matches", () => {
    const result = filterTreeWithAncestors(
      sampleTree,
      (item) => item.id === "A",
      config,
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("A");
  });
});
