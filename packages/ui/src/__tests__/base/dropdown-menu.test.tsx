// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
} from "../../base/navigation/dropdown-menu";

afterEach(cleanup);

describe("DropdownMenu", () => {
  it("renders trigger button", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Open")).toBeDefined();
  });

  it("opens content when open prop is set", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Action")).toBeDefined();
  });

  it("renders with defaultOpen", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Visible</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Visible")).toBeDefined();
  });
});

describe("DropdownMenuContent", () => {
  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent ref={ref}>
          <DropdownMenuItem>I</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent className="my-content">
          <DropdownMenuItem>I</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const content = screen.getByRole("menu");
    expect(content.className).toContain("my-content");
  });
});

describe("DropdownMenuItem", () => {
  it("renders item with text", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Delete")).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem ref={ref}>I</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="my-item">I</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const item = screen.getByRole("menuitem");
    expect(item.className).toContain("my-item");
  });

  it("applies inset data attribute", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset>I</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const item = screen.getByRole("menuitem");
    expect(item.getAttribute("data-inset")).toBe("true");
  });
});

describe("DropdownMenuCheckboxItem", () => {
  it("renders checkbox item", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Check</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const item = screen.getByRole("menuitemcheckbox");
    expect(item).toBeDefined();
    expect(item.getAttribute("data-state")).toBe("checked");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem ref={ref}>C</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("DropdownMenuRadioItem", () => {
  it("renders radio item", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const items = screen.getAllByRole("menuitemradio");
    expect(items.length).toBe(2);
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem ref={ref} value="a">A</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("DropdownMenuLabel", () => {
  it("renders label text", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Settings")).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel ref={ref}>L</DropdownMenuLabel>
          <DropdownMenuItem>I</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies inset data attribute", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>L</DropdownMenuLabel>
          <DropdownMenuItem>I</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const label = screen.getByText("L");
    expect(label.getAttribute("data-inset")).toBe("true");
  });
});

describe("DropdownMenuSeparator", () => {
  it("renders separator", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>B</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const seps = screen.getAllByRole("separator");
    expect(seps.length).toBeGreaterThanOrEqual(1);
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSeparator ref={ref} />
          <DropdownMenuItem>I</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("DropdownMenuSub", () => {
  it("renders sub trigger and content", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("More")).toBeDefined();
  });

  it("forwards ref on SubTrigger", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger ref={ref}>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>SI</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies inset on SubTrigger", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>SI</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByText("More").closest("[data-inset]");
    expect(trigger?.getAttribute("data-inset")).toBe("true");
  });
});

describe("DropdownMenuGroup", () => {
  it("renders group with items", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>G1</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const group = screen.getByRole("group");
    expect(group).toBeDefined();
  });
});
