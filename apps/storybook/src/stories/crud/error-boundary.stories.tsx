import type { Meta, StoryObj } from "@storybook/react";
import { CrudErrorBoundary } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Shared/ErrorBoundary",
  component: CrudErrorBoundary,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
} satisfies Meta<typeof CrudErrorBoundary>;

export default meta;

function BrokenComponent(): never {
  throw new Error("Something went wrong while rendering this component.");
}

export const DefaultFallback: StoryObj = {
  render: () => (
    <CrudErrorBoundary>
      <BrokenComponent />
    </CrudErrorBoundary>
  ),
};

export const CustomFallback: StoryObj = {
  render: () => (
    <CrudErrorBoundary
      fallback={
        <div style={{ padding: 24, textAlign: "center", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Custom error view</p>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>A custom fallback was provided.</p>
        </div>
      }
    >
      <BrokenComponent />
    </CrudErrorBoundary>
  ),
};

export const RenderFunctionFallback: StoryObj = {
  render: () => (
    <CrudErrorBoundary
      fallback={(error, reset) => (
        <div style={{ padding: 24, textAlign: "center", border: "1px solid #ef4444", borderRadius: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>Error: {error.message}</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 12,
              padding: "6px 16px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              background: "transparent",
              fontSize: 13,
            }}
          >
            Retry
          </button>
        </div>
      )}
    >
      <BrokenComponent />
    </CrudErrorBoundary>
  ),
};

export const NoError: StoryObj = {
  render: () => (
    <CrudErrorBoundary>
      <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <p style={{ fontSize: 14 }}>This component renders without errors.</p>
      </div>
    </CrudErrorBoundary>
  ),
};
