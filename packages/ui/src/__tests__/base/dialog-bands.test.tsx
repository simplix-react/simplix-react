// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../base/overlay/dialog";
import { ConfirmDialog } from "../../crud/shared/confirm-dialog";

afterEach(cleanup);

describe("DialogContent bands", () => {
  it("puts everything between the header and the footer into one scrolling body", () => {
    render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <p>first</p>
          <p>second</p>
          <DialogFooter>
            <button type="button">Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const content = screen.getByRole("dialog");
    expect(content.getAttribute("data-banded")).toBe("true");
    const bands = [...content.children].map((child) => child.getAttribute("data-slot"));
    expect(bands.slice(0, 3)).toEqual(["dialog-header", "dialog-body", "dialog-footer"]);
    const body = content.querySelector("[data-slot=dialog-body]")!;
    expect(body.textContent).toBe("firstsecond");
    expect(body.getAttribute("data-head")).toBe("true");
    expect(body.getAttribute("data-foot")).toBe("true");
  });

  it("keeps an explicit DialogBody instead of wrapping it in a second one", () => {
    render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogBody data-testid="own-body">content</DialogBody>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("dialog").querySelectorAll("[data-slot=dialog-body]")).toHaveLength(1);
    expect(screen.getByTestId("own-body").getAttribute("data-foot")).toBe("false");
  });

  it("leaves a dialog without a header or footer exactly as written", () => {
    render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Palette</DialogTitle>
          <p>row</p>
        </DialogContent>
      </Dialog>,
    );
    const content = screen.getByRole("dialog");
    expect(content.getAttribute("data-banded")).toBe("false");
    expect(content.querySelector("[data-slot=dialog-body]")).toBeNull();
  });
});

function Banded() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
        <p>body</p>
        <DialogFooter>
          <button type="button">Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("DialogContent corner close", () => {
  it("closes a banded dialog", () => {
    render(<Banded />);
    fireEvent.click(screen.getByRole("button", { name: "common.close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // jsdom cannot hit-test; the stacking that keeps the button above the header band is pinned here
  // and measured in the browser by mockup checks/.dlg-close.mjs.
  it("stacks the corner group above the header and footer bands", () => {
    render(<Banded />);
    const corner = screen.getByRole("dialog").querySelector("[data-slot=dialog-corner-actions]")!;
    const header = screen.getByRole("dialog").querySelector("[data-slot=dialog-header]")!;
    const z = (el: Element) => Number(/z-\[(\d+)\]/.exec(el.className)?.[1] ?? 0);
    expect(z(corner)).toBeGreaterThan(z(header));
  });
});

describe("ConfirmDialog destructive", () => {
  it("draws the confirm button in the danger tone and focuses Cancel first", () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="Delete?"
        description="Gone for good."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Delete" }).getAttribute("data-tone")).toBe("danger");
    expect(document.activeElement?.textContent).toBe("Cancel");
  });

  it("keeps the primary tone by default", () => {
    render(
      <ConfirmDialog open onOpenChange={() => {}} title="Save?" confirmLabel="Save" onConfirm={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Save" }).getAttribute("data-tone")).toBe("primary");
  });
});
