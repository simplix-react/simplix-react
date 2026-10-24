// @vitest-environment jsdom
import { cleanup, render, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";

afterEach(cleanup);

import React from "react";
import { ListDetail } from "../../crud/patterns/list-detail";
import { drawnClasses } from "../helpers/drawn-classes";

describe("ListDetail Divider drag interactions", () => {
  it("starts drag on pointer down on separator", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    const separator = container.querySelector("[role='separator']") as HTMLElement;
    expect(separator).toBeTruthy();

    // Simulate pointer down to start drag
    fireEvent.pointerDown(separator, { clientX: 400, pointerId: 1 });

    // After drag start, the separator should still be present
    expect(container.querySelector("[role='separator']")).toBeTruthy();
  });

  it("moves divider on pointer move during drag", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    const separator = container.querySelector("[role='separator']") as HTMLElement;

    // Start drag
    fireEvent.pointerDown(separator, { clientX: 400, pointerId: 1 });

    // Move pointer
    fireEvent.pointerMove(separator, { clientX: 500 });

    // Section should still render
    const section = container.querySelector("section");
    expect(section).toBeTruthy();
  });

  it("ends drag on pointer up", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    const separator = container.querySelector("[role='separator']") as HTMLElement;

    // Start drag
    fireEvent.pointerDown(separator, { clientX: 400, pointerId: 1 });
    // Move
    fireEvent.pointerMove(separator, { clientX: 500 });
    // End drag
    fireEvent.pointerUp(separator);

    // At rest the columns do not animate: only opening and closing does.
    const section = container.querySelector("section");
    expect(drawnClasses(section ?? null)).not.toContain("md:transition-[grid-template-columns]");
  });

  it("resizes panels using keyboard on separator (ArrowLeft)", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    const separator = container.querySelector("[role='separator']") as HTMLElement;
    fireEvent.keyDown(separator, { key: "ArrowLeft" });

    // Should not throw
    expect(separator).toBeTruthy();
  });

  it("resizes panels using keyboard on separator (ArrowRight)", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    const separator = container.querySelector("[role='separator']") as HTMLElement;
    fireEvent.keyDown(separator, { key: "ArrowRight" });

    // Should not throw
    expect(separator).toBeTruthy();
  });
});

describe("ListDetail with listWidth prop", () => {
  it("uses listWidth in grid template columns", () => {
    const { container } = render(
      <ListDetail activePanel="detail" listWidth={350}>
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    const section = container.querySelector("section");
    expect(section?.style.gridTemplateColumns).toContain("350px");
    // With listWidth, detail column should be "1fr"
    expect(section?.style.gridTemplateColumns).toContain("1fr");
  });

  it("updates dragListWidth during drag when listWidth is set", () => {
    const { container } = render(
      <ListDetail activePanel="detail" listWidth={350}>
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    const separator = container.querySelector("[role='separator']") as HTMLElement;

    // Drag to resize
    fireEvent.pointerDown(separator, { clientX: 400, pointerId: 1 });
    fireEvent.pointerMove(separator, { clientX: 450 });

    // Section should still render correctly
    const section = container.querySelector("section");
    expect(section).toBeTruthy();

    fireEvent.pointerUp(separator);
  });
});

describe("ListDetail divider collapse behavior", () => {
  it("divider has pointer-events-none and opacity-0 when detail is closed", () => {
    const { container } = render(
      <ListDetail activePanel="list">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    const separator = container.querySelector("[role='separator']") as HTMLElement;
    // Compared as class tokens: the grip's own `before:opacity-0` is not the divider's.
    expect(drawnClasses(separator ?? null).split(/\s+/)).toContain("opacity-0");
    expect(separator?.className).toContain("pointer-events-none");
  });

  it("divider is interactive when detail is open", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    const separator = container.querySelector("[role='separator']") as HTMLElement;
    expect(drawnClasses(separator ?? null).split(/\s+/)).not.toContain("opacity-0");
    expect(separator?.className).not.toContain("pointer-events-none");
  });

  it("divider tabIndex is -1 when collapsed, 0 when active", () => {
    const { container, rerender } = render(
      <ListDetail activePanel="list">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    let separator = container.querySelector("[role='separator']") as HTMLElement;
    expect(separator?.getAttribute("tabindex")).toBe("-1");

    rerender(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    separator = container.querySelector("[role='separator']") as HTMLElement;
    expect(separator?.getAttribute("tabindex")).toBe("0");
  });

  it("suppresses transition during drag (isDragging)", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );

    const separator = container.querySelector("[role='separator']") as HTMLElement;
    const section = container.querySelector("section")!;

    // Before drag, at rest: no transition either.
    expect(drawnClasses(section ?? null)).not.toContain("md:transition-[grid-template-columns]");

    // Start drag
    fireEvent.pointerDown(separator, { clientX: 400, pointerId: 1 });

    // During drag: transition should be suppressed (isDragging = true)
    expect(drawnClasses(section ?? null)).not.toContain("md:transition-[grid-template-columns]");

    // End drag
    fireEvent.pointerUp(separator);

    // After drag: still none, the width the drag left is applied as it stands.
    expect(drawnClasses(section ?? null)).not.toContain("md:transition-[grid-template-columns]");
  });

  it("animates the columns only while the detail opens or closes", () => {
    const { container, rerender } = render(
      <ListDetail activePanel="list">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const section = () => container.querySelector("section");
    expect(drawnClasses(section() ?? null)).not.toContain("md:transition-[grid-template-columns]");
    rerender(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    expect(drawnClasses(section() ?? null)).toContain("md:transition-[grid-template-columns]");
  });
});
