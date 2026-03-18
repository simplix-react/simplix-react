// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../../base/overlay/dialog";

afterEach(cleanup);

describe("Dialog", () => {
  it("opens on trigger click", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <p>Body</p>
        </DialogContent>
      </Dialog>,
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Body")).toBeDefined();
  });

  it("renders with defaultOpen", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <p>Visible</p>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Visible")).toBeDefined();
  });

  it("shows close button by default", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Close")).toBeDefined();
  });

  it("hides close button when showCloseButton=false", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          <DialogTitle>T</DialogTitle>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByText("Close")).toBeNull();
  });
});

describe("DialogContent", () => {
  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dialog defaultOpen>
        <DialogContent ref={ref}>
          <DialogTitle>T</DialogTitle>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className="my-dialog">
          <DialogTitle>T</DialogTitle>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    );
    const content = screen.getByRole("dialog");
    expect(content.className).toContain("my-dialog");
  });
});

describe("DialogOverlay", () => {
  it("is rendered when dialog is open", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    // Overlay is rendered via Portal by DialogContent
    const overlay = document.querySelector("[data-state='open']");
    expect(overlay).not.toBeNull();
  });
});

describe("DialogHeader", () => {
  it("renders header container", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("My Title")).toBeDefined();
  });

  it("merges custom className", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader className="my-header">
            <DialogTitle>T</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    // Content is rendered in a portal, search document.body
    const header = document.body.querySelector(".my-header");
    expect(header).not.toBeNull();
    expect(header!.className).toContain("flex");
  });
});

describe("DialogFooter", () => {
  it("renders footer container", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogFooter>
            <button>OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("OK")).toBeDefined();
  });

  it("merges custom className", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogFooter className="my-footer">
            <button>OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const footer = document.body.querySelector(".my-footer");
    expect(footer).not.toBeNull();
    expect(footer!.className).toContain("flex");
  });
});

describe("DialogTitle", () => {
  it("renders title text", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Hello Dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Hello Dialog")).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle ref={ref}>T</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });

  it("merges custom className", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle className="my-title">T</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const title = screen.getByText("T");
    expect(title.className).toContain("my-title");
    expect(title.className).toContain("text-lg");
  });
});

describe("DialogDescription", () => {
  it("renders description text", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogDescription>Description text</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Description text")).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogDescription ref={ref}>D</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it("merges custom className", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogDescription className="my-desc">D</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const desc = screen.getByText("D");
    expect(desc.className).toContain("my-desc");
    expect(desc.className).toContain("text-muted-foreground");
  });
});

describe("DialogClose", () => {
  it("renders close button", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogClose>Close Me</DialogClose>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Close Me")).toBeDefined();
  });
});
