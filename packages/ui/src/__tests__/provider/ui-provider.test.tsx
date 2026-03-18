// @vitest-environment jsdom
import { cleanup, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { UIComponents } from "../../provider/types";
import { UIProvider, useUIComponents } from "../../provider/ui-provider";

afterEach(cleanup);

describe("useUIComponents", () => {
  it("returns default components when no UIProvider is present", () => {
    const { result } = renderHook(() => useUIComponents());
    const components = result.current;

    // Check base components exist
    expect(components.Input).toBeDefined();
    expect(components.Button).toBeDefined();
    expect(components.Label).toBeDefined();
    expect(components.Textarea).toBeDefined();
    expect(components.Switch).toBeDefined();
    expect(components.Checkbox).toBeDefined();
    expect(components.Badge).toBeDefined();
    expect(components.Calendar).toBeDefined();
    expect(components.Skeleton).toBeDefined();
  });

  it("returns default compound components", () => {
    const { result } = renderHook(() => useUIComponents());
    const components = result.current;

    // Compound components should have sub-components
    expect(components.Select.Root).toBeDefined();
    expect(components.Select.Trigger).toBeDefined();
    expect(components.Select.Content).toBeDefined();
    expect(components.Select.Item).toBeDefined();
    expect(components.Select.Value).toBeDefined();

    expect(components.Dialog.Root).toBeDefined();
    expect(components.Dialog.Content).toBeDefined();
    expect(components.Dialog.Title).toBeDefined();

    expect(components.Table.Root).toBeDefined();
    expect(components.Table.Header).toBeDefined();
    expect(components.Table.Body).toBeDefined();
    expect(components.Table.Row).toBeDefined();
    expect(components.Table.Head).toBeDefined();
    expect(components.Table.Cell).toBeDefined();
  });

  it("returns default primitive components", () => {
    const { result } = renderHook(() => useUIComponents());
    const components = result.current;

    expect(components.Container).toBeDefined();
    expect(components.Stack).toBeDefined();
    expect(components.Flex).toBeDefined();
    expect(components.Grid).toBeDefined();
    expect(components.Heading).toBeDefined();
    expect(components.Text).toBeDefined();
    expect(components.Card).toBeDefined();
    expect(components.Section).toBeDefined();
  });

  it("returns default CRUD components", () => {
    const { result } = renderHook(() => useUIComponents());
    const components = result.current;

    expect(components.SectionShell).toBeDefined();
    expect(components.QueryFallback).toBeDefined();
    expect(components.CrudDelete).toBeDefined();
    expect(components.FieldWrapper).toBeDefined();
    expect(components.DetailFieldWrapper).toBeDefined();
  });
});

describe("UIProvider", () => {
  it("overrides a base component", () => {
    const CustomButton: UIComponents["Button"] = () => null;

    const { result } = renderHook(() => useUIComponents(), {
      wrapper: ({ children }) => (
        <UIProvider overrides={{ Button: CustomButton }}>
          {children}
        </UIProvider>
      ),
    });

    expect(result.current.Button).toBe(CustomButton);
    // Other components should remain as defaults
    expect(result.current.Input).toBeDefined();
    expect(result.current.Input).not.toBe(CustomButton);
  });

  it("deep merges compound component overrides", () => {
    const CustomSelectTrigger: UIComponents["Select"]["Trigger"] = () => null;

    const { result } = renderHook(() => useUIComponents(), {
      wrapper: ({ children }) => (
        <UIProvider overrides={{ Select: { Trigger: CustomSelectTrigger } as Partial<UIComponents["Select"]> as UIComponents["Select"] }}>
          {children}
        </UIProvider>
      ),
    });

    // Overridden sub-component
    expect(result.current.Select.Trigger).toBe(CustomSelectTrigger);
    // Non-overridden sub-components should remain as defaults
    expect(result.current.Select.Root).toBeDefined();
    expect(result.current.Select.Content).toBeDefined();
    expect(result.current.Select.Item).toBeDefined();
    expect(result.current.Select.Value).toBeDefined();
  });

  it("supports nested UIProviders (inner wins)", () => {
    const OuterButton: UIComponents["Button"] = () => null;
    const InnerButton: UIComponents["Button"] = () => null;

    const { result } = renderHook(() => useUIComponents(), {
      wrapper: ({ children }) => (
        <UIProvider overrides={{ Button: OuterButton }}>
          <UIProvider overrides={{ Button: InnerButton }}>
            {children}
          </UIProvider>
        </UIProvider>
      ),
    });

    expect(result.current.Button).toBe(InnerButton);
  });

  it("nested UIProvider inherits parent overrides", () => {
    const CustomInput: UIComponents["Input"] = () => null;
    const CustomButton: UIComponents["Button"] = () => null;

    const { result } = renderHook(() => useUIComponents(), {
      wrapper: ({ children }) => (
        <UIProvider overrides={{ Input: CustomInput }}>
          <UIProvider overrides={{ Button: CustomButton }}>
            {children}
          </UIProvider>
        </UIProvider>
      ),
    });

    expect(result.current.Input).toBe(CustomInput);
    expect(result.current.Button).toBe(CustomButton);
  });

  it("renders children", () => {
    const { getByTestId } = render(
      <UIProvider>
        <span data-testid="child">hello</span>
      </UIProvider>,
    );
    expect(getByTestId("child").textContent).toBe("hello");
  });

  it("works without overrides prop", () => {
    const { result } = renderHook(() => useUIComponents(), {
      wrapper: ({ children }) => <UIProvider>{children}</UIProvider>,
    });

    // Should still return all default components
    expect(result.current.Button).toBeDefined();
    expect(result.current.Input).toBeDefined();
    expect(result.current.Select.Root).toBeDefined();
  });
});
