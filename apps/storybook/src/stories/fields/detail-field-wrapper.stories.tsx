import type { Meta, StoryObj } from "@storybook/react";
import { DetailFieldWrapper } from "@simplix-react/ui";

const meta = {
  title: "Fields/Shared/DetailFieldWrapper",
  component: DetailFieldWrapper,
  tags: ["autodocs"],
  argTypes: {
    layout: {
      control: "select",
      options: ["top", "left", "inline", "hidden"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof DetailFieldWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LayoutTop: Story = {
  name: "Layout: top (default)",
  args: {
    label: "Email",
    layout: "top",
    children: "jane@example.com",
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Email",
    layout: "left",
    children: "jane@example.com",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Status",
    layout: "inline",
    children: "Active",
  },
};

export const LayoutHidden: Story = {
  name: "Layout: hidden",
  args: {
    label: "ID",
    layout: "hidden",
    children: "usr_12345",
  },
};

export const SizeSm: Story = {
  name: "Size: sm",
  args: {
    label: "Small",
    size: "sm",
    children: "Small text value",
  },
};

export const SizeMd: Story = {
  name: "Size: md",
  args: {
    label: "Medium",
    size: "md",
    children: "Medium text value",
  },
};

export const SizeLg: Story = {
  name: "Size: lg",
  args: {
    label: "Large",
    size: "lg",
    children: "Large text value",
  },
};
