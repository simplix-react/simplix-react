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

vi.mock("../../provider/ui-provider", () => ({
  useUIComponents: () => ({
    SectionShell: ({ title, children }: { title?: React.ReactNode; children?: React.ReactNode }) => (
      <section>
        {title && <h3>{title}</h3>}
        {children}
      </section>
    ),
  }),
}));

// Mock useBeforeUnload to avoid side effects
vi.mock("../../crud/form/use-before-unload", () => ({
  useBeforeUnload: vi.fn(),
}));

import React from "react";
import { CrudForm } from "../../crud/form/crud-form";

describe("CrudForm (FormRoot)", () => {
  it("renders with data-testid", () => {
    render(<CrudForm onSubmit={vi.fn()}>Form content</CrudForm>);
    expect(screen.getByTestId("crud-form")).toBeTruthy();
  });

  it("renders children", () => {
    render(<CrudForm onSubmit={vi.fn()}>Form body</CrudForm>);
    expect(screen.getByText("Form body")).toBeTruthy();
  });

  it("renders as a form element", () => {
    render(<CrudForm onSubmit={vi.fn()}>Content</CrudForm>);
    const form = screen.getByTestId("crud-form");
    expect(form.tagName).toBe("FORM");
  });

  it("calls onSubmit and prevents default on form submission", () => {
    const onSubmit = vi.fn();
    render(
      <CrudForm onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </CrudForm>,
    );
    fireEvent.submit(screen.getByTestId("crud-form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders header when provided", () => {
    render(
      <CrudForm onSubmit={vi.fn()} header={<span>Form Header</span>}>
        Body
      </CrudForm>,
    );
    expect(screen.getByText("Form Header")).toBeTruthy();
  });

  it("renders close button when onClose is provided", () => {
    const onClose = vi.fn();
    render(
      <CrudForm onSubmit={vi.fn()} onClose={onClose}>
        Body
      </CrudForm>,
    );
    const buttons = screen.getAllByRole("button");
    // Find the close button (the one that's not a submit button)
    const closeBtn = buttons.find((b) => b.getAttribute("type") === "button");
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders footer when provided", () => {
    render(
      <CrudForm onSubmit={vi.fn()} footer={<div>Form Footer</div>}>
        Body
      </CrudForm>,
    );
    expect(screen.getByText("Form Footer")).toBeTruthy();
  });

  it("does not render footer when not provided", () => {
    render(<CrudForm onSubmit={vi.fn()}>Body</CrudForm>);
    const footerSlot = document.querySelector("[data-crud-slot='footer']");
    expect(footerSlot).toBeNull();
  });

  it("sets data-submitting attribute when isSubmitting", () => {
    render(
      <CrudForm onSubmit={vi.fn()} isSubmitting={true}>
        Body
      </CrudForm>,
    );
    const form = screen.getByTestId("crud-form");
    expect(form.getAttribute("data-submitting")).toBeTruthy();
  });

  it("does not set data-submitting when not submitting", () => {
    render(
      <CrudForm onSubmit={vi.fn()} isSubmitting={false}>
        Body
      </CrudForm>,
    );
    const form = screen.getByTestId("crud-form");
    expect(form.getAttribute("data-submitting")).toBeNull();
  });

  it("does not render header bar when neither onClose nor header provided", () => {
    render(<CrudForm onSubmit={vi.fn()}>Body</CrudForm>);
    const headerSlot = document.querySelector("[data-crud-slot='header']");
    expect(headerSlot).toBeNull();
  });

  it("wraps content with FieldVariantContext.Provider when fieldVariant is set", () => {
    render(
      <CrudForm onSubmit={vi.fn()} fieldVariant={{ layout: "left", size: "lg" }}>
        Body with variant
      </CrudForm>,
    );
    expect(screen.getByText("Body with variant")).toBeTruthy();
    expect(screen.getByTestId("crud-form")).toBeTruthy();
  });
});

describe("CrudForm.Section", () => {
  it("renders section with title", () => {
    render(
      <CrudForm.Section title="Basic Info">
        <div>Field A</div>
      </CrudForm.Section>,
    );
    expect(screen.getByText("Basic Info")).toBeTruthy();
    expect(screen.getByText("Field A")).toBeTruthy();
  });
});

describe("CrudForm.Actions", () => {
  it("renders children", () => {
    render(
      <CrudForm.Actions>
        <button>Cancel</button>
        <button>Save</button>
      </CrudForm.Actions>,
    );
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("applies spread layout when spread=true", () => {
    const { container } = render(
      <CrudForm.Actions spread>
        <button>Left</button>
        <button>Right</button>
      </CrudForm.Actions>,
    );
    const wrapper = container.firstElementChild;
    // justify-between should be present when spread
    expect(wrapper?.className).toContain("justify-between");
  });

  it("applies end layout by default", () => {
    const { container } = render(
      <CrudForm.Actions>
        <button>Right only</button>
      </CrudForm.Actions>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("justify-end");
  });

  it("accepts className prop", () => {
    const { container } = render(
      <CrudForm.Actions className="extra-class">
        <button>Btn</button>
      </CrudForm.Actions>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("extra-class");
  });
});
