// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "../../base/overlay/sheet";

afterEach(cleanup);

describe("Sheet", () => {
  it("opens on trigger click", () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetTitle>T</SheetTitle>
          <p>Sheet Body</p>
        </SheetContent>
      </Sheet>,
    );
    fireEvent.click(screen.getByText("Open Sheet"));
    expect(screen.getByText("Sheet Body")).toBeDefined();
  });

  it("renders with defaultOpen", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>T</SheetTitle>
          <p>Visible</p>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Visible")).toBeDefined();
  });

  it("shows close button by default", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>T</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Close")).toBeDefined();
  });

  it("hides close button when showCloseButton=false", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent showCloseButton={false}>
          <SheetTitle>T</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.queryByText("Close")).toBeNull();
  });
});

describe("SheetContent", () => {
  it("applies right side classes by default", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>T</SheetTitle>
          <p>Content</p>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByRole("dialog");
    expect(content.className).toContain("inset-y-0");
    expect(content.className).toContain("right-0");
  });

  it("applies left side classes", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="left">
          <SheetTitle>T</SheetTitle>
          <p>Content</p>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByRole("dialog");
    expect(content.className).toContain("left-0");
  });

  it("applies top side classes", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="top">
          <SheetTitle>T</SheetTitle>
          <p>Content</p>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByRole("dialog");
    expect(content.className).toContain("top-0");
    expect(content.className).toContain("border-b");
  });

  it("applies bottom side classes", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="bottom">
          <SheetTitle>T</SheetTitle>
          <p>Content</p>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByRole("dialog");
    expect(content.className).toContain("bottom-0");
    expect(content.className).toContain("border-t");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Sheet defaultOpen>
        <SheetContent ref={ref}>
          <SheetTitle>T</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent className="my-sheet">
          <SheetTitle>T</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByRole("dialog");
    expect(content.className).toContain("my-sheet");
  });
});

describe("SheetHeader", () => {
  it("renders children", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Header Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Header Title")).toBeDefined();
  });

  it("merges custom className", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetHeader className="my-header">
            <SheetTitle>T</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const header = document.body.querySelector(".my-header");
    expect(header).not.toBeNull();
    expect(header!.className).toContain("flex");
    expect(header!.className).toContain("p-4");
  });
});

describe("SheetFooter", () => {
  it("renders children", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>T</SheetTitle>
          <SheetFooter>
            <button>Save</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Save")).toBeDefined();
  });

  it("merges custom className", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>T</SheetTitle>
          <SheetFooter className="my-footer">Footer</SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    const footer = document.body.querySelector(".my-footer");
    expect(footer).not.toBeNull();
    expect(footer!.className).toContain("mt-auto");
  });
});

describe("SheetTitle", () => {
  it("renders title text", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Sheet Title</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Sheet Title")).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle ref={ref}>T</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });

  it("merges custom className", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle className="my-title">T</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    const title = screen.getByText("T");
    expect(title.className).toContain("my-title");
    expect(title.className).toContain("font-semibold");
  });
});

describe("SheetDescription", () => {
  it("renders description text", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>T</SheetTitle>
          <SheetDescription>A description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("A description")).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>T</SheetTitle>
          <SheetDescription ref={ref}>D</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it("merges custom className", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>T</SheetTitle>
          <SheetDescription className="my-desc">D</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    const desc = screen.getByText("D");
    expect(desc.className).toContain("my-desc");
    expect(desc.className).toContain("text-muted-foreground");
  });
});

describe("SheetClose", () => {
  it("renders close trigger", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>T</SheetTitle>
          <SheetClose>Close Me</SheetClose>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Close Me")).toBeDefined();
  });
});
