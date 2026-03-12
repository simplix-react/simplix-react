import type { Meta, StoryObj } from "@storybook/react";
import { Flex } from "@simplix-react/ui";
import type { CSSProperties } from "react";

const boxStyle = (color: string): CSSProperties => ({
  background: color,
  color: "#fff",
  padding: "12px 24px",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 14,
  textAlign: "center",
  minWidth: 60,
});

const meta = {
  title: "Primitives/Flex",
  component: Flex,
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: "select",
      options: ["row", "column"],
      description: "Flex direction (defaults to row, unlike Stack which defaults to column)",
    },
    gap: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around"],
    },
    wrap: { control: "boolean" },
    fill: { control: "boolean" },
    flex: { control: "boolean" },
    padded: { control: "boolean" },
  },
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultChildren = (
  <>
    <div style={boxStyle("#3b82f6")}>A</div>
    <div style={boxStyle("#8b5cf6")}>B</div>
    <div style={boxStyle("#06b6d4")}>C</div>
  </>
);

// -- Playground --

export const Playground: Story = {
  args: {
    gap: "md",
    align: "center",
    children: defaultChildren,
  },
};

// -- Default behavior (row) --

export const DefaultRow: Story = {
  name: "Default: row direction",
  args: {
    gap: "md",
    children: defaultChildren,
  },
};

// -- Gap variants in row --

export const GapComparison: Story = {
  name: "Gap Comparison (row)",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((gap) => (
        <div key={gap}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
            gap=&quot;{gap}&quot;
          </div>
          <Flex gap={gap}>{defaultChildren}</Flex>
        </div>
      ))}
    </div>
  ),
};

// -- Align in row --

export const AlignCenter: Story = {
  name: "Align: center (row)",
  args: {
    gap: "md",
    align: "center",
    children: (
      <>
        <div style={{ ...boxStyle("#3b82f6"), height: 40 }}>Short</div>
        <div style={{ ...boxStyle("#8b5cf6"), height: 80 }}>Tall</div>
        <div style={{ ...boxStyle("#06b6d4"), height: 60 }}>Medium</div>
      </>
    ),
  },
};

// -- Justify variants --

export const JustifyBetween: Story = {
  name: "Justify: between",
  args: {
    gap: "md",
    justify: "between",
    children: defaultChildren,
    style: { width: 500 },
  },
};

// -- Wrapping --

export const WrapEnabled: Story = {
  name: "Wrap: enabled",
  args: {
    gap: "sm",
    wrap: true,
    style: { width: 200 },
    children: (
      <>
        <div style={boxStyle("#3b82f6")}>One</div>
        <div style={boxStyle("#8b5cf6")}>Two</div>
        <div style={boxStyle("#06b6d4")}>Three</div>
        <div style={boxStyle("#f59e0b")}>Four</div>
      </>
    ),
  },
};

// -- Realistic usage --

export const NavigationBar: Story = {
  name: "Example: Navigation Bar",
  render: () => (
    <Flex
      gap="md"
      align="center"
      justify="between"
      style={{ width: 600, padding: "12px 16px", background: "#1f2937", borderRadius: 8 }}
    >
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Logo</div>
      <Flex gap="sm" align="center">
        <div style={{ color: "#d1d5db", fontSize: 14 }}>Home</div>
        <div style={{ color: "#d1d5db", fontSize: 14 }}>About</div>
        <div style={{ color: "#d1d5db", fontSize: 14 }}>Contact</div>
      </Flex>
      <div style={boxStyle("#3b82f6")}>Sign In</div>
    </Flex>
  ),
};

export const FormActions: Story = {
  name: "Example: Form Actions",
  render: () => (
    <Flex gap="sm" justify="end" style={{ width: 400 }}>
      <div style={boxStyle("#6b7280")}>Cancel</div>
      <div style={boxStyle("#3b82f6")}>Save</div>
    </Flex>
  ),
};
