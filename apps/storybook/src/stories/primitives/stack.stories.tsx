import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "@simplix-react/ui";
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
  title: "Primitives/Stack",
  component: Stack,
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: "select",
      options: ["column", "row"],
      description: "Flex direction",
    },
    gap: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
      description: "Gap between children",
    },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"],
      description: "Cross-axis alignment (items-*)",
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around"],
      description: "Main-axis alignment (justify-*)",
    },
    wrap: {
      control: "boolean",
      description: "Allow wrapping",
    },
    fill: {
      control: "boolean",
      description: "Fill parent height (h-full)",
    },
    flex: {
      control: "boolean",
      description: "Flex-grow (flex-1 min-h-0)",
    },
    padded: {
      control: "boolean",
      description: "Vertical padding (pt-4 pb-8)",
    },
  },
} satisfies Meta<typeof Stack>;

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
    direction: "column",
    gap: "md",
    align: "stretch",
    children: defaultChildren,
  },
};

// -- Direction --

export const Column: Story = {
  name: "Direction: column (default)",
  args: { direction: "column", gap: "md", children: defaultChildren },
};

export const Row: Story = {
  name: "Direction: row",
  args: { direction: "row", gap: "md", children: defaultChildren },
};

// -- Gap variants --

export const GapNone: Story = {
  name: "Gap: none",
  args: { gap: "none", children: defaultChildren },
};

export const GapXs: Story = {
  name: "Gap: xs",
  args: { gap: "xs", children: defaultChildren },
};

export const GapSm: Story = {
  name: "Gap: sm",
  args: { gap: "sm", children: defaultChildren },
};

export const GapMd: Story = {
  name: "Gap: md",
  args: { gap: "md", children: defaultChildren },
};

export const GapLg: Story = {
  name: "Gap: lg",
  args: { gap: "lg", children: defaultChildren },
};

export const GapXl: Story = {
  name: "Gap: xl",
  args: { gap: "xl", children: defaultChildren },
};

// -- Align variants --

export const AlignStart: Story = {
  name: "Align: start",
  args: {
    direction: "row",
    gap: "md",
    align: "start",
    children: (
      <>
        <div style={{ ...boxStyle("#3b82f6"), height: 40 }}>Short</div>
        <div style={{ ...boxStyle("#8b5cf6"), height: 80 }}>Tall</div>
        <div style={{ ...boxStyle("#06b6d4"), height: 60 }}>Medium</div>
      </>
    ),
  },
};

export const AlignCenter: Story = {
  name: "Align: center",
  args: {
    direction: "row",
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

export const AlignEnd: Story = {
  name: "Align: end",
  args: {
    direction: "row",
    gap: "md",
    align: "end",
    children: (
      <>
        <div style={{ ...boxStyle("#3b82f6"), height: 40 }}>Short</div>
        <div style={{ ...boxStyle("#8b5cf6"), height: 80 }}>Tall</div>
        <div style={{ ...boxStyle("#06b6d4"), height: 60 }}>Medium</div>
      </>
    ),
  },
};

export const AlignStretch: Story = {
  name: "Align: stretch (default)",
  args: {
    direction: "row",
    gap: "md",
    align: "stretch",
    children: defaultChildren,
    style: { height: 100 },
  },
};

export const AlignBaseline: Story = {
  name: "Align: baseline",
  args: {
    direction: "row",
    gap: "md",
    align: "baseline",
    children: (
      <>
        <div style={{ ...boxStyle("#3b82f6"), fontSize: 12 }}>Small</div>
        <div style={{ ...boxStyle("#8b5cf6"), fontSize: 24 }}>Large</div>
        <div style={{ ...boxStyle("#06b6d4"), fontSize: 16 }}>Medium</div>
      </>
    ),
  },
};

// -- Justify variants --

export const JustifyStart: Story = {
  name: "Justify: start",
  args: {
    direction: "row",
    gap: "md",
    justify: "start",
    children: defaultChildren,
    style: { width: 500 },
  },
};

export const JustifyCenter: Story = {
  name: "Justify: center",
  args: {
    direction: "row",
    gap: "md",
    justify: "center",
    children: defaultChildren,
    style: { width: 500 },
  },
};

export const JustifyEnd: Story = {
  name: "Justify: end",
  args: {
    direction: "row",
    gap: "md",
    justify: "end",
    children: defaultChildren,
    style: { width: 500 },
  },
};

export const JustifyBetween: Story = {
  name: "Justify: between",
  args: {
    direction: "row",
    gap: "md",
    justify: "between",
    children: defaultChildren,
    style: { width: 500 },
  },
};

export const JustifyAround: Story = {
  name: "Justify: around",
  args: {
    direction: "row",
    gap: "md",
    justify: "around",
    children: defaultChildren,
    style: { width: 500 },
  },
};

// -- Wrap --

export const Wrapping: Story = {
  name: "Wrap: enabled",
  args: {
    direction: "row",
    gap: "sm",
    wrap: true,
    style: { width: 200 },
    children: (
      <>
        <div style={boxStyle("#3b82f6")}>Item 1</div>
        <div style={boxStyle("#8b5cf6")}>Item 2</div>
        <div style={boxStyle("#06b6d4")}>Item 3</div>
        <div style={boxStyle("#f59e0b")}>Item 4</div>
      </>
    ),
  },
};

// -- Boolean variants --

export const Padded: Story = {
  args: {
    padded: true,
    children: defaultChildren,
    style: { background: "#f3f4f6" },
  },
};

// -- Realistic usage --

export const ToolbarExample: Story = {
  name: "Example: Toolbar Layout",
  render: () => (
    <Stack direction="row" gap="sm" align="center" justify="between" style={{ width: 480 }}>
      <Stack direction="row" gap="sm" align="center">
        <div style={boxStyle("#3b82f6")}>Save</div>
        <div style={boxStyle("#6b7280")}>Cancel</div>
      </Stack>
      <div style={boxStyle("#ef4444")}>Delete</div>
    </Stack>
  ),
};
