import { describe, it, expect } from "vitest";
import { buildEmbeddedTree, buildTreeFromFlatRows } from "../tree-builder.js";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

interface NumericCategory {
  id: number;
  name: string;
  parentId: number | null;
}

describe("buildEmbeddedTree", () => {
  it("builds a single root with children", () => {
    const rows: Category[] = [
      { id: "1", name: "Root", parentId: null },
      { id: "2", name: "Child A", parentId: "1" },
      { id: "3", name: "Child B", parentId: "1" },
    ];

    const tree = buildEmbeddedTree(rows);

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe("Root");
    expect(tree[0].children).toHaveLength(2);
  });

  it("builds multi-level nesting", () => {
    const rows: Category[] = [
      { id: "1", name: "Root", parentId: null },
      { id: "2", name: "Child", parentId: "1" },
      { id: "3", name: "Grandchild", parentId: "2" },
    ];

    const tree = buildEmbeddedTree(rows);

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);

    const child = tree[0].children[0] as Category & { children: unknown[] };
    expect(child.name).toBe("Child");
    expect(child.children).toHaveLength(1);

    const grandchild = child.children[0] as Category & { children: unknown[] };
    expect(grandchild.name).toBe("Grandchild");
    expect(grandchild.children).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    const tree = buildEmbeddedTree([]);
    expect(tree).toHaveLength(0);
  });

  it("returns single node tree", () => {
    const rows: Category[] = [{ id: "1", name: "Only", parentId: null }];

    const tree = buildEmbeddedTree(rows);

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe("Only");
    expect(tree[0].children).toHaveLength(0);
  });

  it("treats orphaned nodes (missing parent) as roots", () => {
    const rows: Category[] = [
      { id: "2", name: "Orphan", parentId: "999" },
      { id: "3", name: "Root", parentId: null },
    ];

    const tree = buildEmbeddedTree(rows);

    expect(tree).toHaveLength(2);
    const names = tree.map((n) => n.name);
    expect(names).toContain("Orphan");
    expect(names).toContain("Root");
  });

  it("handles multiple root nodes", () => {
    const rows: Category[] = [
      { id: "1", name: "Root A", parentId: null },
      { id: "2", name: "Root B", parentId: null },
      { id: "3", name: "Child of A", parentId: "1" },
    ];

    const tree = buildEmbeddedTree(rows);

    expect(tree).toHaveLength(2);

    const rootA = tree.find((n) => n.name === "Root A")!;
    expect(rootA.children).toHaveLength(1);

    const rootB = tree.find((n) => n.name === "Root B")!;
    expect(rootB.children).toHaveLength(0);
  });

  it("supports custom identity and parent fields", () => {
    const rows = [
      { code: "A", label: "Root", parent: null },
      { code: "B", label: "Child", parent: "A" },
    ];

    const tree = buildEmbeddedTree(rows, "code", "parent");

    expect(tree).toHaveLength(1);
    expect((tree[0] as Record<string, unknown>).label).toBe("Root");
    expect(tree[0].children).toHaveLength(1);
  });

  it("handles deep nesting (4 levels)", () => {
    const rows: Category[] = [
      { id: "1", name: "L1", parentId: null },
      { id: "2", name: "L2", parentId: "1" },
      { id: "3", name: "L3", parentId: "2" },
      { id: "4", name: "L4", parentId: "3" },
    ];

    const tree = buildEmbeddedTree(rows);

    expect(tree).toHaveLength(1);

    let current = tree[0] as Category & { children: unknown[] };
    for (const expectedName of ["L1", "L2", "L3", "L4"]) {
      expect(current.name).toBe(expectedName);
      if (expectedName !== "L4") {
        expect(current.children).toHaveLength(1);
        current = current.children[0] as Category & { children: unknown[] };
      } else {
        expect(current.children).toHaveLength(0);
      }
    }
  });
});

describe("buildTreeFromFlatRows", () => {
  it("wraps each row in a TreeNode with data and children", () => {
    const rows: Category[] = [
      { id: "1", name: "Root", parentId: null },
      { id: "2", name: "Child", parentId: "1" },
    ];

    const tree = buildTreeFromFlatRows(rows);

    expect(tree).toHaveLength(1);
    expect(tree[0].data).toEqual({ id: "1", name: "Root", parentId: null });
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].data).toEqual({ id: "2", name: "Child", parentId: "1" });
  });

  it("returns empty array for empty input", () => {
    const tree = buildTreeFromFlatRows([]);
    expect(tree).toHaveLength(0);
  });

  it("returns single node tree", () => {
    const rows: Category[] = [{ id: "1", name: "Only", parentId: null }];

    const tree = buildTreeFromFlatRows(rows);

    expect(tree).toHaveLength(1);
    expect(tree[0].data.name).toBe("Only");
    expect(tree[0].children).toHaveLength(0);
  });

  it("treats orphaned nodes as roots", () => {
    const rows: Category[] = [
      { id: "1", name: "Orphan", parentId: "missing" },
    ];

    const tree = buildTreeFromFlatRows(rows);

    expect(tree).toHaveLength(1);
    expect(tree[0].data.name).toBe("Orphan");
  });

  it("builds multi-level nesting", () => {
    const rows: Category[] = [
      { id: "1", name: "Root", parentId: null },
      { id: "2", name: "Child", parentId: "1" },
      { id: "3", name: "Grandchild", parentId: "2" },
    ];

    const tree = buildTreeFromFlatRows(rows);

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(tree[0].children[0].children[0].data.name).toBe("Grandchild");
  });

  it("handles multiple roots with children", () => {
    const rows: Category[] = [
      { id: "1", name: "Root A", parentId: null },
      { id: "2", name: "Root B", parentId: null },
      { id: "3", name: "Child of A", parentId: "1" },
      { id: "4", name: "Child of B", parentId: "2" },
    ];

    const tree = buildTreeFromFlatRows(rows);

    expect(tree).toHaveLength(2);

    const rootA = tree.find((n) => n.data.name === "Root A")!;
    expect(rootA.children).toHaveLength(1);
    expect(rootA.children[0].data.name).toBe("Child of A");

    const rootB = tree.find((n) => n.data.name === "Root B")!;
    expect(rootB.children).toHaveLength(1);
    expect(rootB.children[0].data.name).toBe("Child of B");
  });

  it("uses custom identity field", () => {
    const rows = [
      { code: "A", name: "Root", parentId: null },
      { code: "B", name: "Child", parentId: "A" },
    ];

    const tree = buildTreeFromFlatRows(rows, "code");

    expect(tree).toHaveLength(1);
    expect(tree[0].data.name).toBe("Root");
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].data.name).toBe("Child");
  });

  it("handles numeric ids", () => {
    const rows: NumericCategory[] = [
      { id: 1, name: "Root", parentId: null },
      { id: 2, name: "Child", parentId: 1 },
    ];

    const tree = buildTreeFromFlatRows(rows);

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
  });

  it("handles deep nesting (4 levels)", () => {
    const rows: Category[] = [
      { id: "1", name: "L1", parentId: null },
      { id: "2", name: "L2", parentId: "1" },
      { id: "3", name: "L3", parentId: "2" },
      { id: "4", name: "L4", parentId: "3" },
    ];

    const tree = buildTreeFromFlatRows(rows);

    expect(tree).toHaveLength(1);

    let current = tree[0];
    for (const expectedName of ["L1", "L2", "L3", "L4"]) {
      expect(current.data.name).toBe(expectedName);
      if (expectedName !== "L4") {
        expect(current.children).toHaveLength(1);
        current = current.children[0];
      } else {
        expect(current.children).toHaveLength(0);
      }
    }
  });
});
