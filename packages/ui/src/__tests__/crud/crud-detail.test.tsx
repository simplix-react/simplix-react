// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

vi.mock("../../provider/ui-provider", () => {
  const mockSectionShell = ({ title, children }: { title?: React.ReactNode; children?: React.ReactNode }) => (
    <section>
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
  const mockComponents = {
    Button: (props: Record<string, unknown>) => <button {...props} />,
    SectionShell: mockSectionShell,
  };
  return {
    useUIComponents: () => mockComponents,
    useFlatUIComponents: () => mockComponents,
  };
});

import React from "react";
import { CrudDetail } from "../../crud/detail/crud-detail";

describe("CrudDetail (DetailRoot)", () => {
  it("renders with data-testid", () => {
    render(<CrudDetail>Content here</CrudDetail>);
    expect(screen.getByTestId("crud-detail")).toBeTruthy();
  });

  it("renders children", () => {
    render(<CrudDetail>Hello Detail</CrudDetail>);
    expect(screen.getByText("Hello Detail")).toBeTruthy();
  });

  it("renders header when provided", () => {
    render(
      <CrudDetail header={<span>My Header</span>}>
        Body
      </CrudDetail>,
    );
    expect(screen.getByText("My Header")).toBeTruthy();
  });

  it("renders close button when onClose is provided", () => {
    const onClose = vi.fn();
    render(
      <CrudDetail onClose={onClose}>
        Body
      </CrudDetail>,
    );
    // The close button wraps an XIcon svg
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders footer when provided", () => {
    render(
      <CrudDetail footer={<div>Footer Content</div>}>
        Body
      </CrudDetail>,
    );
    expect(screen.getByText("Footer Content")).toBeTruthy();
  });

  it("does not render footer slot when not provided", () => {
    const { container } = render(<CrudDetail>Body</CrudDetail>);
    const footerSlot = container.querySelector("[data-crud-slot='footer']");
    expect(footerSlot).toBeNull();
  });

  it("shows loading overlay when isLoading is true", () => {
    render(<CrudDetail isLoading={true}>Content</CrudDetail>);
    const output = screen.getByRole("status");
    expect(output.getAttribute("aria-busy")).toBe("true");
  });

  it("does not show loading overlay when isLoading is false", () => {
    const { container } = render(<CrudDetail isLoading={false}>Content</CrudDetail>);
    expect(container.querySelector("[aria-busy]")).toBeNull();
  });

  it("does not render header bar when neither onClose nor header provided", () => {
    const { container } = render(<CrudDetail>Content</CrudDetail>);
    const headerSlot = container.querySelector("[data-crud-slot='header']");
    expect(headerSlot).toBeNull();
  });
});

describe("CrudDetail.Section", () => {
  it("renders section with title", () => {
    render(
      <CrudDetail.Section title="Basic Info">
        <div>Field A</div>
      </CrudDetail.Section>,
    );
    expect(screen.getByText("Basic Info")).toBeTruthy();
    expect(screen.getByText("Field A")).toBeTruthy();
  });
});

describe("CrudDetail.Actions", () => {
  it("renders children", () => {
    render(
      <CrudDetail.Actions>
        <button>Action 1</button>
      </CrudDetail.Actions>,
    );
    expect(screen.getByText("Action 1")).toBeTruthy();
  });

  it("accepts className prop", () => {
    const { container } = render(
      <CrudDetail.Actions className="custom-class">
        <button>Action</button>
      </CrudDetail.Actions>,
    );
    const el = container.firstElementChild;
    expect(el?.className).toContain("custom-class");
  });
});

describe("CrudDetail.DefaultActions", () => {
  it("renders back button when onBack is provided", () => {
    const onBack = vi.fn();
    render(<CrudDetail.DefaultActions onBack={onBack} />);
    const backBtn = screen.getByText("common.back");
    expect(backBtn).toBeTruthy();
    fireEvent.click(backBtn.closest("button")!);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders close button when onClose is provided (not onBack)", () => {
    const onClose = vi.fn();
    render(<CrudDetail.DefaultActions onClose={onClose} />);
    const closeBtn = screen.getByText("common.close");
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn.closest("button")!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders edit button when onEdit is provided", () => {
    const onEdit = vi.fn();
    render(<CrudDetail.DefaultActions onEdit={onEdit} />);
    const editBtn = screen.getByText("common.edit");
    expect(editBtn).toBeTruthy();
    fireEvent.click(editBtn.closest("button")!);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("renders delete button when onDelete is provided", () => {
    const onDelete = vi.fn();
    const { container } = render(<CrudDetail.DefaultActions onDelete={onDelete} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(1);
    fireEvent.click(buttons[0]);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("disables edit and delete when isPending", () => {
    const { container } = render(
      <CrudDetail.DefaultActions
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isPending={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    for (const btn of Array.from(buttons)) {
      expect(btn).toHaveProperty("disabled", true);
    }
  });

  it("renders nothing on left when no onBack or onClose", () => {
    const { container } = render(<CrudDetail.DefaultActions onEdit={vi.fn()} />);
    expect(container.textContent).not.toContain("common.back");
    expect(container.textContent).not.toContain("common.close");
  });

  it("accepts custom labels", () => {
    render(
      <CrudDetail.DefaultActions
        onBack={vi.fn()}
        onEdit={vi.fn()}
        backLabel="Go back"
        editLabel="Modify"
      />,
    );
    expect(screen.getByText("Go back")).toBeTruthy();
    expect(screen.getByText("Modify")).toBeTruthy();
  });
});
