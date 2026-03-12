import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/ListField",
  component: DetailFields.DetailListField,
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["badges", "comma", "bullet"],
    },
    layout: {
      control: "select",
      options: ["top", "left", "inline", "hidden"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof DetailFields.DetailListField>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTags = ["React", "TypeScript", "Node.js", "GraphQL"];

export const Badges: Story = {
  name: "Mode: badges",
  args: {
    label: "Tags",
    value: sampleTags,
    mode: "badges",
  },
};

export const Comma: Story = {
  name: "Mode: comma",
  args: {
    label: "Skills",
    value: sampleTags,
    mode: "comma",
  },
};

export const Bullet: Story = {
  name: "Mode: bullet",
  args: {
    label: "Steps",
    value: ["Install dependencies", "Configure settings", "Run build", "Deploy"],
    mode: "bullet",
  },
};

export const EmptyArray: Story = {
  args: {
    label: "Tags",
    value: [],
  },
};

export const NullValue: Story = {
  args: {
    label: "Categories",
    value: null,
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Tags",
    value: null,
    fallback: "No tags assigned",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Roles",
    value: ["Admin", "Editor"],
    mode: "badges",
    layout: "inline",
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Languages",
    value: ["Korean", "English", "Japanese"],
    mode: "comma",
    layout: "left",
  },
};
