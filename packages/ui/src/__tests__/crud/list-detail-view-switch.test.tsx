// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

import React from "react";
import { ListDetailViewSwitch } from "../../crud/patterns/list-detail-view-switch";
import type { UseListDetailStateResult } from "../../crud/patterns/use-list-detail-state";
import type { UseFadeTransitionResult } from "../../crud/patterns/use-fade-transition";

function createState(
  view: UseListDetailStateResult["view"],
  selectedId: string | null = null,
): UseListDetailStateResult {
  return {
    view,
    selectedId,
    showDetail: vi.fn(),
    showList: vi.fn(),
    showNew: vi.fn(),
    showEdit: vi.fn(),
  };
}

function createFade(displayedId: string | null = null): UseFadeTransitionResult {
  return {
    displayedId,
    fading: false,
    style: { opacity: 1, transition: "opacity 200ms" },
  };
}

describe("ListDetailViewSwitch", () => {
  it("renders detail view when view is detail and displayedId is set", () => {
    const state = createState("detail", "42");
    const fade = createFade("42");
    render(
      <ListDetailViewSwitch
        state={state}
        fade={fade}
        renderDetail={(id) => <div>Detail for {id}</div>}
      />,
    );
    expect(screen.getByText("Detail for 42")).toBeTruthy();
  });

  it("renders null for detail view when displayedId is null", () => {
    const state = createState("detail", "42");
    const fade = createFade(null);
    const { container } = render(
      <ListDetailViewSwitch
        state={state}
        fade={fade}
        renderDetail={(id) => <div>Detail for {id}</div>}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders new view when view is new and renderNew is provided", () => {
    const state = createState("new");
    const fade = createFade();
    render(
      <ListDetailViewSwitch
        state={state}
        fade={fade}
        renderDetail={() => <div>Detail</div>}
        renderNew={() => <div>New Form</div>}
      />,
    );
    expect(screen.getByText("New Form")).toBeTruthy();
  });

  it("renders null for new view when renderNew is not provided", () => {
    const state = createState("new");
    const fade = createFade();
    const { container } = render(
      <ListDetailViewSwitch
        state={state}
        fade={fade}
        renderDetail={() => <div>Detail</div>}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders edit view when view is edit with selectedId and renderEdit", () => {
    const state = createState("edit", "7");
    const fade = createFade();
    render(
      <ListDetailViewSwitch
        state={state}
        fade={fade}
        renderDetail={() => <div>Detail</div>}
        renderEdit={(id) => <div>Edit {id}</div>}
      />,
    );
    expect(screen.getByText("Edit 7")).toBeTruthy();
  });

  it("renders null for edit view when selectedId is null", () => {
    const state = createState("edit", null);
    const fade = createFade();
    const { container } = render(
      <ListDetailViewSwitch
        state={state}
        fade={fade}
        renderDetail={() => <div>Detail</div>}
        renderEdit={(id) => <div>Edit {id}</div>}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders null for edit view when renderEdit is not provided", () => {
    const state = createState("edit", "7");
    const fade = createFade();
    const { container } = render(
      <ListDetailViewSwitch
        state={state}
        fade={fade}
        renderDetail={() => <div>Detail</div>}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders null for empty view", () => {
    const state = createState("empty");
    const fade = createFade();
    const { container } = render(
      <ListDetailViewSwitch
        state={state}
        fade={fade}
        renderDetail={() => <div>Detail</div>}
      />,
    );
    expect(container.innerHTML).toBe("");
  });
});
