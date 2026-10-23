// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PlateViewerImpl } from "../../fields/plate-editor/plate-viewer-impl";
import { drawnClasses } from "../helpers/drawn-classes";

afterEach(cleanup);

function Harness() {
  return (
    <PlateViewerImpl
      variant="basic"
      value={[
        { type: "h2", children: [{ text: "Title" }] },
        { type: "blockquote", children: [{ text: "Quote" }] },
        { type: "p", children: [{ text: "Body" }] },
      ]}
    />
  );
}

describe("plate node slots", () => {
  it("draws each node component from its slot", () => {
    const { container } = render(<Harness />);
    const slot = (name: string) => container.querySelector(`[data-slot="${name}"]`);
    expect(drawnClasses(slot("plate-heading"))).toContain("text-xl");
    expect(slot("plate-heading")?.getAttribute("data-level")).toBe("2");
    expect(drawnClasses(slot("plate-blockquote"))).toContain("border-l-4");
    expect(drawnClasses(slot("plate-paragraph"))).toContain("my-2");
    const editor = slot("plate-editor");
    expect(editor?.getAttribute("data-padding")).toBe("none");
    expect(drawnClasses(editor).split(" ")).toContain("p-0");
    expect(drawnClasses(editor).split(" ")).not.toContain("p-4");
  });
});
