// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "../../base/inputs/command";

afterEach(cleanup);

describe("Command", () => {
  it("renders with base classes", () => {
    const { container } = render(<Command data-testid="cmd" />);
    const cmd = container.firstElementChild as HTMLElement;
    expect(cmd.className).toContain("flex");
    expect(cmd.className).toContain("overflow-hidden");
    expect(cmd.className).toContain("rounded-md");
  });

  it("merges custom className", () => {
    const { container } = render(<Command className="my-cmd" />);
    const cmd = container.firstElementChild as HTMLElement;
    expect(cmd.className).toContain("my-cmd");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Command ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("CommandInput", () => {
  it("renders an input with placeholder", () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
      </Command>,
    );
    expect(screen.getByPlaceholderText("Search...")).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Command>
        <CommandInput ref={ref} />
      </Command>,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("renders search icon", () => {
    const { container } = render(
      <Command>
        <CommandInput placeholder="Search" />
      </Command>,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});

describe("CommandList", () => {
  it("renders and forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Command>
        <CommandList ref={ref}>
          <CommandGroup>
            <CommandItem>Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByText("Item")).toBeDefined();
  });
});

describe("CommandEmpty", () => {
  it("renders empty message when no items match", () => {
    render(
      <Command>
        <CommandInput value="zzz-nonexistent" />
        <CommandList>
          <CommandEmpty>No results found</CommandEmpty>
          <CommandGroup>
            <CommandItem>Real item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText("No results found")).toBeDefined();
  });
});

describe("CommandGroup", () => {
  it("renders group with items", () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem>Item 1</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText("Item 1")).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Command>
        <CommandList>
          <CommandGroup ref={ref}>
            <CommandItem>Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("CommandItem", () => {
  it("renders item text", () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem>Test Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText("Test Item")).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem ref={ref}>Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("CommandSeparator", () => {
  it("renders separator and forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem>A</CommandItem>
          </CommandGroup>
          <CommandSeparator ref={ref} />
          <CommandGroup>
            <CommandItem>B</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    const seps = container.querySelectorAll("[cmdk-separator]");
    expect(seps.length).toBeGreaterThanOrEqual(1);
  });
});
