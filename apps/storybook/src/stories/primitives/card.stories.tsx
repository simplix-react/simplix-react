import type { Meta, StoryObj } from "@storybook/react";
import { Card, Text } from "@simplix-react/ui";

const meta = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
      description: "Internal padding size",
    },
    interactive: {
      control: "boolean",
      description: "Enables hover/click styles and renders as button by default",
    },
    as: {
      control: "select",
      options: ["div", "button", "article"],
      description: "Override the rendered HTML tag",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- Playground --

export const Playground: Story = {
  args: {
    padding: "md",
    interactive: false,
    children: "This is a card with customizable props. Use the controls below to explore.",
  },
};

// -- Padding variants --

export const PaddingNone: Story = {
  name: "Padding: none",
  args: { padding: "none", children: "No padding" },
};

export const PaddingSm: Story = {
  name: "Padding: sm",
  args: { padding: "sm", children: "Small padding (p-4)" },
};

export const PaddingMd: Story = {
  name: "Padding: md",
  args: { padding: "md", children: "Medium padding (p-6) - default" },
};

export const PaddingLg: Story = {
  name: "Padding: lg",
  args: { padding: "lg", children: "Large padding (p-8)" },
};

// -- Interactive --

export const Interactive: Story = {
  args: {
    interactive: true,
    onClick: () => alert("Card clicked!"),
    children: "Click me - I'm an interactive card",
  },
};

export const NonInteractive: Story = {
  args: {
    interactive: false,
    children: "Static content card",
  },
};

// -- Tag override --

export const AsArticle: Story = {
  name: "Tag: article",
  args: {
    as: "article",
    children: "Rendered as an <article> element for semantic content",
  },
};

export const AsButton: Story = {
  name: "Tag: button (explicit)",
  args: {
    as: "button",
    interactive: true,
    onClick: () => alert("Button card clicked!"),
    children: "Explicitly set as <button>",
  },
};

// -- Realistic usage --

export const ProfileCard: Story = {
  name: "Example: Profile Card",
  render: () => (
    <Card padding="lg" style={{ width: 320 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Text size="lg" tone="default" style={{ fontWeight: 600 }}>
          Jane Cooper
        </Text>
        <Text size="sm" tone="muted">
          Senior Product Designer at Acme Corp
        </Text>
        <Text size="sm" tone="primary">
          jane.cooper@acme.com
        </Text>
      </div>
    </Card>
  ),
};

export const InteractiveList: Story = {
  name: "Example: Interactive List Items",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 360 }}>
      {["Project Alpha", "Project Beta", "Project Gamma"].map((name) => (
        <Card key={name} interactive padding="sm" onClick={() => alert(name)}>
          <Text size="sm">{name}</Text>
        </Card>
      ))}
    </div>
  ),
};
