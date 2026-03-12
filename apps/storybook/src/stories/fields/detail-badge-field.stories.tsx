import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/BadgeField",
  component: DetailFields.DetailBadgeField,
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
} satisfies Meta<typeof DetailFields.DetailBadgeField>;

export default meta;
type Story = StoryObj<typeof meta>;

const statusVariants = {
  active: "success" as const,
  inactive: "secondary" as const,
  banned: "destructive" as const,
};

export const Active: Story = {
  args: {
    label: "Status",
    value: "active",
    variants: statusVariants,
  },
};

export const Inactive: Story = {
  args: {
    label: "Status",
    value: "inactive",
    variants: statusVariants,
  },
};

export const Destructive: Story = {
  args: {
    label: "Status",
    value: "banned",
    variants: statusVariants,
  },
};

export const WithDisplayValue: Story = {
  args: {
    label: "Status",
    value: "active",
    displayValue: "Active User",
    variants: statusVariants,
  },
};

export const NullValue: Story = {
  args: {
    label: "Status",
    value: null,
    variants: statusVariants,
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Status",
    value: null,
    variants: statusVariants,
    fallback: "Unknown",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Status",
    value: "active",
    variants: statusVariants,
    layout: "inline",
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Account Status",
    value: "inactive",
    variants: statusVariants,
    layout: "left",
  },
};
