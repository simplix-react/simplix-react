// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "../../base/inputs/select";

afterEach(cleanup);

describe("SelectTrigger", () => {
  it("renders a trigger button", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDefined();
    expect(trigger.tagName).toBe("BUTTON");
  });

  it("applies base classes", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toContain("flex");
    expect(trigger.className).toContain("rounded-md");
    expect(trigger.className).toContain("border-input");
  });

  it("merges custom className", () => {
    render(
      <Select>
        <SelectTrigger className="my-trigger">
          <SelectValue />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toContain("my-trigger");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Select>
        <SelectTrigger ref={ref}>
          <SelectValue />
        </SelectTrigger>
      </Select>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders chevron icon", () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("shows placeholder text", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByText("Select an option")).toBeDefined();
  });
});

describe("SelectLabel", () => {
  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel ref={ref}>Group</SelectLabel>
            <SelectItem value="a">A</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("SelectSeparator", () => {
  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectSeparator ref={ref} />
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
