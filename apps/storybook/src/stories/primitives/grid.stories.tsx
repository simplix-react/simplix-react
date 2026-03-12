import type { Meta, StoryObj } from "@storybook/react";
import { Grid, Text } from "@simplix-react/ui";
import type { CSSProperties } from "react";

const cellStyle = (color: string): CSSProperties => ({
  background: color,
  color: "#fff",
  padding: "16px",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 14,
  textAlign: "center",
});

const meta = {
  title: "Primitives/Grid",
  component: Grid,
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: "select",
      options: [1, 2, 3, 4, 5, 6],
      description: "Number of grid columns",
    },
    gap: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
      description: "Gap between grid cells",
    },
    responsive: {
      control: "boolean",
      description: "Enable container-query responsive columns (default: true)",
    },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"];
const cells = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} style={cellStyle(colors[i % colors.length])}>
      Cell {i + 1}
    </div>
  ));

// -- Playground --

export const Playground: Story = {
  args: {
    columns: 3,
    gap: "md",
    responsive: true,
    children: cells(6),
  },
};

// -- Column variants --

export const Columns1: Story = {
  name: "Columns: 1",
  args: { columns: 1, gap: "md", children: cells(3) },
};

export const Columns2: Story = {
  name: "Columns: 2",
  args: { columns: 2, gap: "md", children: cells(4) },
};

export const Columns3: Story = {
  name: "Columns: 3",
  args: { columns: 3, gap: "md", children: cells(6) },
};

export const Columns4: Story = {
  name: "Columns: 4",
  args: { columns: 4, gap: "md", children: cells(8) },
};

export const Columns5: Story = {
  name: "Columns: 5",
  args: { columns: 5, gap: "md", children: cells(10) },
};

export const Columns6: Story = {
  name: "Columns: 6",
  args: { columns: 6, gap: "md", children: cells(6) },
};

// -- Gap variants --

export const GapNone: Story = {
  name: "Gap: none",
  args: { columns: 3, gap: "none", children: cells(6) },
};

export const GapXs: Story = {
  name: "Gap: xs",
  args: { columns: 3, gap: "xs", children: cells(6) },
};

export const GapSm: Story = {
  name: "Gap: sm",
  args: { columns: 3, gap: "sm", children: cells(6) },
};

export const GapMd: Story = {
  name: "Gap: md",
  args: { columns: 3, gap: "md", children: cells(6) },
};

export const GapLg: Story = {
  name: "Gap: lg",
  args: { columns: 3, gap: "lg", children: cells(6) },
};

export const GapXl: Story = {
  name: "Gap: xl",
  args: { columns: 3, gap: "xl", children: cells(6) },
};

// -- Responsive --

export const ResponsiveEnabled: Story = {
  name: "Responsive: true (default)",
  args: {
    columns: 4,
    gap: "md",
    responsive: true,
    children: cells(8),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Columns responsively decrease based on container width using CSS container queries. Resize the viewport to see the effect.",
      },
    },
  },
};

export const ResponsiveDisabled: Story = {
  name: "Responsive: false",
  args: {
    columns: 4,
    gap: "md",
    responsive: false,
    children: cells(8),
  },
  parameters: {
    docs: {
      description: {
        story: "Fixed column count regardless of container width.",
      },
    },
  },
};

// -- Realistic usage --

export const DashboardCards: Story = {
  name: "Example: Dashboard Metrics",
  render: () => (
    <Grid columns={4} gap="md">
      {[
        { label: "Total Users", value: "12,345" },
        { label: "Active Today", value: "1,234" },
        { label: "Revenue", value: "$45,678" },
        { label: "Conversion", value: "3.2%" },
      ].map((metric) => (
        <div
          key={metric.label}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <Text size="sm" tone="muted">
            {metric.label}
          </Text>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{metric.value}</div>
        </div>
      ))}
    </Grid>
  ),
};

export const FormLayout: Story = {
  name: "Example: Form Field Grid",
  render: () => (
    <Grid columns={2} gap="md">
      {["First Name", "Last Name", "Email", "Phone"].map((label) => (
        <div key={label}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>
            {label}
          </div>
          <div
            style={{
              height: 36,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              background: "#fff",
            }}
          />
        </div>
      ))}
    </Grid>
  ),
};
