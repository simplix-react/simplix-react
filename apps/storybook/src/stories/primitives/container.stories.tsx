import type { Meta, StoryObj } from "@storybook/react";
import { Container, Text } from "@simplix-react/ui";

const meta = {
  title: "Primitives/Container",
  component: Container,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["2xl", "sm", "md", "lg", "xl", "full"],
      description: "Maximum width constraint",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: "#f3f4f6", padding: "24px 0", minHeight: 120 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

const innerContent = (
  <div
    style={{
      background: "#3b82f6",
      color: "#fff",
      padding: 16,
      borderRadius: 8,
      textAlign: "center",
    }}
  >
    Container content area
  </div>
);

// -- Playground --

export const Playground: Story = {
  args: {
    size: "lg",
    children: innerContent,
  },
};

// -- Size variants --

export const Size2xl: Story = {
  name: "Size: 2xl (max-w-2xl)",
  args: { size: "2xl", children: innerContent },
};

export const SizeSm: Story = {
  name: "Size: sm",
  args: { size: "sm", children: innerContent },
};

export const SizeMd: Story = {
  name: "Size: md",
  args: { size: "md", children: innerContent },
};

export const SizeLg: Story = {
  name: "Size: lg (default)",
  args: { size: "lg", children: innerContent },
};

export const SizeXl: Story = {
  name: "Size: xl",
  args: { size: "xl", children: innerContent },
};

export const SizeFull: Story = {
  name: "Size: full",
  args: { size: "full", children: innerContent },
};

// -- Comparison --

export const SizeComparison: Story = {
  name: "All Sizes Compared",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["2xl", "sm", "md", "lg", "xl", "full"] as const).map((size) => (
        <Container key={size} size={size}>
          <div
            style={{
              background: "#3b82f6",
              color: "#fff",
              padding: 12,
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <Text size="sm" style={{ color: "inherit" }}>
              size=&quot;{size}&quot;
            </Text>
          </div>
        </Container>
      ))}
    </div>
  ),
};
