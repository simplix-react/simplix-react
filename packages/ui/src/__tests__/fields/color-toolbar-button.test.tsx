// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);
beforeEach(() => {
  addMarks.mockClear();
});

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: "en", exists: () => true }),
}));

const addMarks = vi.fn();

// The component only needs a selection and the mark transforms; a full Plate
// editor is not required to exercise the custom-colour form.
vi.mock("platejs/react", () => ({
  useEditorRef: () => ({
    selection: { anchor: 0, focus: 0 },
    tf: { addMarks: (...args: unknown[]) => addMarks(...args), removeMarks: vi.fn(), focus: vi.fn() },
  }),
  useEditorSelector: () => undefined,
}));

import { ColorToolbarButton } from "../../fields/plate-editor/components/color-toolbar-button";

describe("ColorToolbarButton", () => {
  it("does not submit an ancestor form when the custom colour is committed", () => {
    const hostSubmit = vi.fn();

    render(
      <form onSubmit={hostSubmit}>
        <ColorToolbarButton nodeType="color" tooltip="tt">swatch</ColorToolbarButton>
      </form>,
    );

    fireEvent.click(screen.getByText("swatch"));

    const hex = screen.getByPlaceholderText("#000000");
    fireEvent.change(hex, { target: { value: "#112233" } });
    // The popover's colour form holds a single text input, so the browser submits
    // it implicitly on Enter; fireEvent.submit models that.
    fireEvent.submit(hex.closest("form")!);

    expect(addMarks).toHaveBeenCalledWith({ color: "#112233" });
    expect(hostSubmit).not.toHaveBeenCalled();
  });
});
