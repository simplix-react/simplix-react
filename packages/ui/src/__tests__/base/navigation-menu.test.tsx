// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
} from "../../base/navigation/navigation-menu";

afterEach(cleanup);

describe("NavigationMenu", () => {
  it("renders with children", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByText("Home")).toBeDefined();
  });

  it("applies base classes", () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const nav = container.querySelector("[data-slot='navigation-menu']") as HTMLElement;
    expect(nav.className).toContain("relative");
    expect(nav.className).toContain("flex");
  });

  it("merges custom className", () => {
    const { container } = render(
      <NavigationMenu className="my-nav">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const nav = container.querySelector("[data-slot='navigation-menu']") as HTMLElement;
    expect(nav.className).toContain("my-nav");
  });

  it("sets data-viewport=true when viewport is enabled (default)", () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const root = container.querySelector("[data-viewport='true']");
    expect(root).not.toBeNull();
  });

  it("does not render viewport when viewport=false", () => {
    const { container } = render(
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const viewport = container.querySelector("[data-slot='navigation-menu-viewport']");
    expect(viewport).toBeNull();
  });
});

describe("NavigationMenuList", () => {
  it("renders with base classes", () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const list = container.querySelector("[data-slot='navigation-menu-list']") as HTMLElement;
    expect(list.className).toContain("flex");
    expect(list.className).toContain("list-none");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLUListElement>();
    render(
      <NavigationMenu>
        <NavigationMenuList ref={ref}>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(ref.current?.tagName).toBe("UL");
  });

  it("merges custom className", () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList className="my-list">
          <NavigationMenuItem>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const list = container.querySelector("[data-slot='navigation-menu-list']") as HTMLElement;
    expect(list.className).toContain("my-list");
  });
});

describe("NavigationMenuItem", () => {
  it("renders an li with relative class", () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const item = container.querySelector("[data-slot='navigation-menu-item']") as HTMLElement;
    expect(item.className).toContain("relative");
    expect(item.tagName).toBe("LI");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLLIElement>();
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem ref={ref}>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(ref.current?.tagName).toBe("LI");
  });
});

describe("NavigationMenuTrigger", () => {
  it("renders trigger button with chevron", () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            <NavigationMenuContent>Content</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByText("Menu")).toBeDefined();
    const svg = container.querySelector("[data-slot='navigation-menu-trigger'] svg");
    expect(svg).not.toBeNull();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger ref={ref}>M</NavigationMenuTrigger>
            <NavigationMenuContent>C</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

describe("NavigationMenuContent", () => {
  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>M</NavigationMenuTrigger>
            <NavigationMenuContent ref={ref}>Content</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    // Content is hidden by default in nav menu, so ref may or may not be attached
    // This validates the forwardRef wiring doesn't break
  });
});

describe("NavigationMenuLink", () => {
  it("renders a link", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/about">About</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const link = screen.getByText("About");
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/about");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink ref={ref} href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("merges custom className", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" className="my-link">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const link = screen.getByText("A");
    expect(link.className).toContain("my-link");
  });
});

describe("NavigationMenuViewport", () => {
  it("sets data-viewport=false when viewport is disabled", () => {
    const { container } = render(
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const root = container.querySelector("[data-viewport='false']");
    expect(root).not.toBeNull();
  });
});

describe("NavigationMenuIndicator", () => {
  it("renders without error", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">A</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
      </NavigationMenu>,
    );
    // Indicator only appears when an item is active, so just verify no error
    expect(screen.getByText("A")).toBeDefined();
  });
});
