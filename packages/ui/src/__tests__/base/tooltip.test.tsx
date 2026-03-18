// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../../base/overlay/tooltip";

afterEach(cleanup);

describe("TooltipProvider", () => {
  it("renders children", () => {
    render(
      <TooltipProvider>
        <span data-testid="child">hello</span>
      </TooltipProvider>,
    );
    expect(screen.getByTestId("child").textContent).toBe("hello");
  });
});

describe("Tooltip", () => {
  it("renders trigger", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText("Hover me")).toBeDefined();
  });

  it("shows tooltip content when open", () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip open>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const matches = screen.getAllByText("Tooltip text");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});

describe("TooltipContent", () => {
  it("renders content text", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>T</TooltipTrigger>
          <TooltipContent>Content here</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const matches = screen.getAllByText("Content here");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>T</TooltipTrigger>
          <TooltipContent ref={ref}>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>T</TooltipTrigger>
          <TooltipContent className="my-tooltip">Tip Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const el = document.body.querySelector(".my-tooltip");
    expect(el).not.toBeNull();
  });
});
