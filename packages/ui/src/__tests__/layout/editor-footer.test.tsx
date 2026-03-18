// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EditorFooter } from "../../layout/editor-footer";

afterEach(cleanup);

describe("EditorFooter", () => {
  it("renders children", () => {
    render(
      <EditorFooter>
        <button>Save</button>
        <button>Cancel</button>
      </EditorFooter>,
    );
    expect(screen.getByText("Save")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("applies base classes", () => {
    const { container } = render(
      <EditorFooter>
        <span>content</span>
      </EditorFooter>,
    );
    const el = container.firstElementChild!;
    expect(el.className).toContain("border-t");
    expect(el.className).toContain("shrink-0");
  });

  it("merges custom className", () => {
    const { container } = render(
      <EditorFooter className="custom-class">
        <span>content</span>
      </EditorFooter>,
    );
    const el = container.firstElementChild!;
    expect(el.className).toContain("custom-class");
    expect(el.className).toContain("border-t");
  });
});
