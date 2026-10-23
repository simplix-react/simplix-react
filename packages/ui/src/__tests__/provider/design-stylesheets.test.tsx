// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Design } from "../../design/design";
import { UIProvider } from "../../provider/ui-provider";

afterEach(cleanup);

describe("UIProvider design stylesheets", () => {
  it("adds a design's stylesheets, then switches the document to it, and undoes both on unmount", async () => {
    let resolve!: (sheets: readonly string[]) => void;
    const design: Design = { id: "probe", load: () => new Promise((r) => (resolve = r)) };
    const { unmount } = render(<UIProvider design={design}><span /></UIProvider>);
    expect(document.documentElement.getAttribute("data-design")).toBeNull();
    await act(async () => resolve([".probe{color:red}"]));
    expect(document.documentElement.getAttribute("data-design")).toBe("probe");
    expect(document.querySelectorAll("style[data-design-stylesheet=probe]")).toHaveLength(1);
    unmount();
    expect(document.documentElement.getAttribute("data-design")).toBeNull();
    expect(document.querySelectorAll("style[data-design-stylesheet=probe]")).toHaveLength(0);
  });

  it("sets a design without stylesheets at once", () => {
    render(<UIProvider design={{ id: "classic" }}><span /></UIProvider>);
    expect(document.documentElement.getAttribute("data-design")).toBe("classic");
  });
});
