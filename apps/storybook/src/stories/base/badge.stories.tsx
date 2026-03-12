import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@simplix-react/ui";

const meta = {
  title: "Base/Display/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "success",
        "warning",
        "slate",
        "red",
        "orange",
        "amber",
        "yellow",
        "lime",
        "green",
        "emerald",
        "teal",
        "cyan",
        "sky",
        "blue",
        "indigo",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose",
      ],
    },
    rounded: {
      control: "select",
      options: ["full", "lg", "md", "sm", "none"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Badge" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Draft" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Error" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Pending" },
};

export const Success: Story = {
  args: { variant: "success", children: "Active" },
};

export const Warning: Story = {
  args: { variant: "warning", children: "Expiring" },
};

export const RoundedMd: Story = {
  name: "Rounded: md",
  args: { rounded: "md", children: "Rounded MD" },
};

export const RoundedNone: Story = {
  name: "Rounded: none",
  args: { rounded: "none", children: "Square" },
};

export const SemanticVariants: Story = {
  name: "Semantic Variants",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
    </div>
  ),
};

export const ColorPalette: Story = {
  name: "Color Palette",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Badge variant="slate">Slate</Badge>
      <Badge variant="red">Red</Badge>
      <Badge variant="orange">Orange</Badge>
      <Badge variant="amber">Amber</Badge>
      <Badge variant="yellow">Yellow</Badge>
      <Badge variant="lime">Lime</Badge>
      <Badge variant="green">Green</Badge>
      <Badge variant="emerald">Emerald</Badge>
      <Badge variant="teal">Teal</Badge>
      <Badge variant="cyan">Cyan</Badge>
      <Badge variant="sky">Sky</Badge>
      <Badge variant="blue">Blue</Badge>
      <Badge variant="indigo">Indigo</Badge>
      <Badge variant="violet">Violet</Badge>
      <Badge variant="purple">Purple</Badge>
      <Badge variant="fuchsia">Fuchsia</Badge>
      <Badge variant="pink">Pink</Badge>
      <Badge variant="rose">Rose</Badge>
    </div>
  ),
};

export const RoundedVariants: Story = {
  name: "Rounded Variants",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Badge rounded="full">Full</Badge>
      <Badge rounded="lg">Large</Badge>
      <Badge rounded="md">Medium</Badge>
      <Badge rounded="sm">Small</Badge>
      <Badge rounded="none">None</Badge>
    </div>
  ),
};
