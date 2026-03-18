// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

import { CrudErrorBoundary } from "../../crud/shared/error-boundary";

function ThrowError({ message }: { message: string }): never {
  throw new Error(message);
}

describe("CrudErrorBoundary", () => {
  // Suppress console.error for expected errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when no error", () => {
    render(
      <CrudErrorBoundary>
        <div>All good</div>
      </CrudErrorBoundary>,
    );
    expect(screen.getByText("All good")).toBeTruthy();
  });

  it("renders default fallback on error", () => {
    render(
      <CrudErrorBoundary>
        <ThrowError message="Test error" />
      </CrudErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("Test error")).toBeTruthy();
    expect(screen.getByText("Try again")).toBeTruthy();
  });

  it("renders custom ReactNode fallback on error", () => {
    render(
      <CrudErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowError message="Boom" />
      </CrudErrorBoundary>,
    );
    expect(screen.getByText("Custom error UI")).toBeTruthy();
  });

  it("renders custom render function fallback on error", () => {
    const fallback = vi.fn((error: Error, reset: () => void) => (
      <div>
        <span>{error.message}</span>
        <button onClick={reset}>Reset</button>
      </div>
    ));

    render(
      <CrudErrorBoundary fallback={fallback}>
        <ThrowError message="Custom error" />
      </CrudErrorBoundary>,
    );

    expect(fallback).toHaveBeenCalled();
    expect(screen.getByText("Custom error")).toBeTruthy();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <CrudErrorBoundary onError={onError}>
        <ThrowError message="Caught" />
      </CrudErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Caught" }),
      expect.any(Object),
    );
  });

  it("resets state when Try again is clicked", () => {
    let shouldThrow = true;
    function ConditionalError() {
      if (shouldThrow) throw new Error("Oops");
      return <div>Recovered</div>;
    }

    render(
      <CrudErrorBoundary>
        <ConditionalError />
      </CrudErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeTruthy();

    shouldThrow = false;
    fireEvent.click(screen.getByText("Try again"));

    expect(screen.getByText("Recovered")).toBeTruthy();
  });

  it("resets state when custom fallback calls reset", () => {
    let shouldThrow = true;
    function ConditionalError() {
      if (shouldThrow) throw new Error("Fail");
      return <div>Fixed</div>;
    }

    render(
      <CrudErrorBoundary
        fallback={(_, reset) => <button onClick={reset}>Retry</button>}
      >
        <ConditionalError />
      </CrudErrorBoundary>,
    );

    expect(screen.getByText("Retry")).toBeTruthy();

    shouldThrow = false;
    fireEvent.click(screen.getByText("Retry"));

    expect(screen.getByText("Fixed")).toBeTruthy();
  });
});
