// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

import React from "react";
import { ListDetail } from "../../crud/patterns/list-detail";

describe("ListDetail (panel variant extended)", () => {
  it("shows detail panel with opacity-100 when activePanel=detail", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const articles = container.querySelectorAll("article");
    const detailPanel = Array.from(articles).find((a) => a.className.includes("order-3"));
    expect(detailPanel?.className).toContain("opacity-100");
  });

  it("hides detail panel with opacity-0 when activePanel=list", () => {
    const { container } = render(
      <ListDetail activePanel="list">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const articles = container.querySelectorAll("article");
    const detailPanel = Array.from(articles).find((a) => a.className.includes("order-3"));
    expect(detailPanel?.className).toContain("opacity-0");
  });

  it("renders grid template when detail is open", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const section = container.querySelector("section");
    expect(section?.style.gridTemplateColumns).toContain("px");
  });

  it("does not render grid template when detail is closed", () => {
    const { container } = render(
      <ListDetail activePanel="list">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const section = container.querySelector("section");
    expect(section?.style.gridTemplateColumns).toBe("");
  });

  it("accepts custom detailWidth", () => {
    const { container } = render(
      <ListDetail activePanel="detail" detailWidth={600}>
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const section = container.querySelector("section");
    expect(section?.style.gridTemplateColumns).toContain("600px");
  });

  it("accepts custom listWidth", () => {
    const { container } = render(
      <ListDetail activePanel="detail" listWidth={400}>
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const section = container.querySelector("section");
    expect(section?.style.gridTemplateColumns).toContain("400px");
  });

  it("renders separator with col-resize cursor", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const separator = container.querySelector("[role='separator']");
    expect(separator?.className).toContain("cursor-col-resize");
  });

  it("handles keyboard navigation on separator", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const separator = container.querySelector("[role='separator']") as HTMLElement;
    // Should not throw on keyboard events
    fireEvent.keyDown(separator, { key: "ArrowLeft" });
    fireEvent.keyDown(separator, { key: "ArrowRight" });
  });
});

describe("ListDetail (dialog variant extended)", () => {
  it("renders dialog overlay when activePanel=detail", () => {
    render(
      <ListDetail variant="dialog" activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Dialog Detail Content</ListDetail.Detail>
      </ListDetail>,
    );
    // Dialog should be visible
    expect(screen.getByText("Dialog Detail Content")).toBeTruthy();
  });

  it("renders list in section without dialog structure", () => {
    const { container } = render(
      <ListDetail variant="dialog" activePanel="list">
        <ListDetail.List>List Only</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const section = container.querySelector("section");
    expect(section).toBeTruthy();
    expect(screen.getByText("List Only")).toBeTruthy();
  });

  it("does not render grid in dialog mode", () => {
    const { container } = render(
      <ListDetail variant="dialog" activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const section = container.querySelector("section");
    // Dialog mode doesn't use grid
    expect(section?.style.gridTemplateColumns).toBeFalsy();
  });

  it("does not render separator in dialog mode", () => {
    const { container } = render(
      <ListDetail variant="dialog" activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const separator = container.querySelector("[role='separator']");
    expect(separator).toBeNull();
  });

  it("applies dialogHeight style when provided", () => {
    render(
      <ListDetail variant="dialog" activePanel="detail" dialogHeight="500px">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail Content</ListDetail.Detail>
      </ListDetail>,
    );
    // Dialog content should be rendered
    expect(screen.getByText("Detail Content")).toBeTruthy();
  });

  it("calls onClose when dialog is dismissed", () => {
    const onClose = vi.fn();
    render(
      <ListDetail variant="dialog" activePanel="detail" onClose={onClose}>
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    // Dialog portal renders an overlay. Pressing Escape should dismiss.
    fireEvent.keyDown(document, { key: "Escape" });
    // onClose should be called when dialog closes
    expect(onClose).toHaveBeenCalled();
  });
});

describe("ListDetail.List panel classes", () => {
  it("has pr-4 when detail is open in panel mode", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const listPanel = container.querySelector("[data-panel='list']");
    expect(listPanel?.className).toContain("md:pr-4");
  });

  it("does not have pr-4 when detail is closed", () => {
    const { container } = render(
      <ListDetail activePanel="list">
        <ListDetail.List>List</ListDetail.List>
      </ListDetail>,
    );
    const listPanel = container.querySelector("[data-panel='list']");
    expect(listPanel?.className).not.toContain("md:pr-4");
  });

  it("hides list on mobile when detail is active", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const listPanel = container.querySelector("[data-panel='list']");
    expect(listPanel?.className).toContain("max-md:hidden");
  });
});
