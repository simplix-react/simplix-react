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

import React from "react";
import { CrudTree } from "../../crud/tree/crud-tree";

describe("CrudTree (TreeRoot)", () => {
  it("renders with data-testid", () => {
    render(<CrudTree>Content</CrudTree>);
    expect(screen.getByTestId("crud-tree")).toBeTruthy();
  });

  it("renders children", () => {
    render(<CrudTree>Hello Tree</CrudTree>);
    expect(screen.getByText("Hello Tree")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(<CrudTree className="my-tree">Content</CrudTree>);
    const el = container.querySelector("[data-testid='crud-tree']");
    expect(el?.className).toContain("my-tree");
  });
});

describe("CrudTree.Toolbar", () => {
  it("renders children", () => {
    render(
      <CrudTree.Toolbar>
        <button>Create</button>
      </CrudTree.Toolbar>,
    );
    expect(screen.getByText("Create")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <CrudTree.Toolbar className="my-toolbar">Content</CrudTree.Toolbar>,
    );
    expect(container.firstElementChild?.className).toContain("my-toolbar");
  });
});

describe("CrudTree.Search", () => {
  it("renders search input with default placeholder from context", () => {
    render(
      <CrudTree>
        <CrudTree.Search />
      </CrudTree>,
    );
    const input = screen.getByPlaceholderText("tree.searchPlaceholder");
    expect(input).toBeTruthy();
  });

  it("renders with custom placeholder", () => {
    render(
      <CrudTree>
        <CrudTree.Search placeholder="Find nodes..." />
      </CrudTree>,
    );
    expect(screen.getByPlaceholderText("Find nodes...")).toBeTruthy();
  });

  it("uses controlled value when provided", () => {
    const onChange = vi.fn();
    render(
      <CrudTree>
        <CrudTree.Search value="test" onChange={onChange} />
      </CrudTree>,
    );
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe("test");
  });

  it("calls onChange when controlled", () => {
    const onChange = vi.fn();
    render(
      <CrudTree>
        <CrudTree.Search value="" onChange={onChange} />
      </CrudTree>,
    );
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalledWith("hello");
  });
});

describe("CrudTree.Column", () => {
  it("renders null (declaration-only component)", () => {
    const { container } = render(<CrudTree.Column field="name" header="Name" />);
    expect(container.innerHTML).toBe("");
  });
});

describe("CrudTree.ExpandToggle", () => {
  it("renders nothing when no expansion context", () => {
    const { container } = render(
      <CrudTree>
        <CrudTree.ExpandToggle />
      </CrudTree>,
    );
    // ExpandToggle renders null when expansion is not set via Table
    // The CrudTree context initially has expansion=null
    // Check that no expand/collapse buttons are rendered
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(0);
  });
});
