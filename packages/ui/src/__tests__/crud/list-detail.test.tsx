// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";

afterEach(cleanup);

import React from "react";
import { ListDetail } from "../../crud/patterns/list-detail";

describe("ListDetail (panel variant)", () => {
  it("renders children in a section element", () => {
    render(
      <ListDetail>
        <ListDetail.List>List Content</ListDetail.List>
        <ListDetail.Detail>Detail Content</ListDetail.Detail>
      </ListDetail>,
    );
    expect(screen.getByText("List Content")).toBeTruthy();
    expect(screen.getByText("Detail Content")).toBeTruthy();
  });

  it("renders list panel with data-panel attribute", () => {
    const { container } = render(
      <ListDetail>
        <ListDetail.List>List</ListDetail.List>
      </ListDetail>,
    );
    expect(container.querySelector("[data-panel='list']")).toBeTruthy();
  });

  it("applies custom className to root", () => {
    const { container } = render(
      <ListDetail className="my-layout">
        <ListDetail.List>List</ListDetail.List>
      </ListDetail>,
    );
    const section = container.querySelector("section");
    expect(section?.className).toContain("my-layout");
  });

  it("renders list panel with className", () => {
    const { container } = render(
      <ListDetail>
        <ListDetail.List className="my-list">List</ListDetail.List>
      </ListDetail>,
    );
    const listPanel = container.querySelector("[data-panel='list']");
    expect(listPanel?.className).toContain("my-list");
  });

  it("defaults to panel variant", () => {
    const { container } = render(
      <ListDetail>
        <ListDetail.List>List</ListDetail.List>
      </ListDetail>,
    );
    // Panel variant renders a section with order classes
    const listPanel = container.querySelector("[data-panel='list']");
    expect(listPanel?.className).toContain("md:order-1");
  });

  it("renders detail panel with order-3 in panel mode", () => {
    const { container } = render(
      <ListDetail activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const articles = container.querySelectorAll("article");
    // Detail article has order-3
    const detailPanel = Array.from(articles).find((a) => a.className.includes("order-3"));
    expect(detailPanel).toBeTruthy();
  });

  it("renders divider separator", () => {
    const { container } = render(
      <ListDetail>
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const separator = container.querySelector("[role='separator']");
    expect(separator).toBeTruthy();
  });
});

describe("ListDetail (dialog variant)", () => {
  it("renders list content in a section", () => {
    render(
      <ListDetail variant="dialog">
        <ListDetail.List>List Content</ListDetail.List>
        <ListDetail.Detail>Detail Content</ListDetail.Detail>
      </ListDetail>,
    );
    expect(screen.getByText("List Content")).toBeTruthy();
  });

  it("does not render data-panel list with panel order in dialog mode", () => {
    const { container } = render(
      <ListDetail variant="dialog">
        <ListDetail.List>List</ListDetail.List>
      </ListDetail>,
    );
    const listPanel = container.querySelector("[data-panel='list']");
    // In dialog mode, list doesn't have md:order-1
    expect(listPanel?.className).not.toContain("md:order-1");
  });
});
