// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

import { Wizard } from "../../crud/form/wizard";

describe("Wizard", () => {
  it("renders step indicator with step titles", () => {
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Basic">Step 1 content</Wizard.Step>
        <Wizard.Step title="Details">Step 2 content</Wizard.Step>
        <Wizard.Step title="Review">Step 3 content</Wizard.Step>
      </Wizard>,
    );
    expect(screen.getByText("Basic")).toBeTruthy();
    expect(screen.getByText("Details")).toBeTruthy();
    expect(screen.getByText("Review")).toBeTruthy();
  });

  it("shows first step content by default", () => {
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Step 1">First content</Wizard.Step>
        <Wizard.Step title="Step 2">Second content</Wizard.Step>
      </Wizard>,
    );
    expect(screen.getByText("First content")).toBeTruthy();
    expect(screen.queryByText("Second content")).toBeNull();
  });

  it("navigates to next step on Next click", () => {
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Step 1">First</Wizard.Step>
        <Wizard.Step title="Step 2">Second</Wizard.Step>
      </Wizard>,
    );
    fireEvent.click(screen.getByText("Next"));
    expect(screen.queryByText("First")).toBeNull();
    expect(screen.getByText("Second")).toBeTruthy();
  });

  it("navigates back on Previous click", () => {
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Step 1">First</Wizard.Step>
        <Wizard.Step title="Step 2">Second</Wizard.Step>
      </Wizard>,
    );
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Second")).toBeTruthy();

    fireEvent.click(screen.getByText("Previous"));
    expect(screen.getByText("First")).toBeTruthy();
  });

  it("disables Previous button on first step", () => {
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Step 1">First</Wizard.Step>
        <Wizard.Step title="Step 2">Second</Wizard.Step>
      </Wizard>,
    );
    expect(screen.getByText("Previous")).toHaveProperty("disabled", true);
  });

  it("shows Complete button on last step", () => {
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Step 1">First</Wizard.Step>
        <Wizard.Step title="Step 2">Second</Wizard.Step>
      </Wizard>,
    );
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Complete")).toBeTruthy();
  });

  it("calls onComplete when Complete is clicked on last step", () => {
    const onComplete = vi.fn();
    render(
      <Wizard onComplete={onComplete}>
        <Wizard.Step title="Step 1">First</Wizard.Step>
        <Wizard.Step title="Step 2">Second</Wizard.Step>
      </Wizard>,
    );
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Complete"));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("validates before advancing when validate is provided", async () => {
    const validate = vi.fn().mockResolvedValue(false);
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Step 1" validate={validate}>
          First
        </Wizard.Step>
        <Wizard.Step title="Step 2">Second</Wizard.Step>
      </Wizard>,
    );
    fireEvent.click(screen.getByText("Next"));

    await waitFor(() => {
      expect(validate).toHaveBeenCalled();
    });

    // Should not advance because validation returned false
    expect(screen.getByText("First")).toBeTruthy();
    expect(screen.queryByText("Second")).toBeNull();
  });

  it("advances when validation returns true", async () => {
    const validate = vi.fn().mockResolvedValue(true);
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Step 1" validate={validate}>
          First
        </Wizard.Step>
        <Wizard.Step title="Step 2">Second</Wizard.Step>
      </Wizard>,
    );
    fireEvent.click(screen.getByText("Next"));

    await waitFor(() => {
      expect(screen.getByText("Second")).toBeTruthy();
    });
  });

  it("shows step description when provided", () => {
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Basic" description="Enter basic info">
          Content
        </Wizard.Step>
      </Wizard>,
    );
    expect(screen.getByText("Enter basic info")).toBeTruthy();
  });

  it("marks current step with aria-current", () => {
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Step 1">First</Wizard.Step>
        <Wizard.Step title="Step 2">Second</Wizard.Step>
      </Wizard>,
    );
    const stepIndicator = document.querySelector("[aria-current='step']");
    expect(stepIndicator).toBeTruthy();
    expect(stepIndicator?.textContent).toBe("1");
  });

  it("shows section with step label", () => {
    render(
      <Wizard onComplete={vi.fn()}>
        <Wizard.Step title="Basic">Content</Wizard.Step>
      </Wizard>,
    );
    const section = document.querySelector("section");
    expect(section?.getAttribute("aria-label")).toContain("Basic");
  });
});
