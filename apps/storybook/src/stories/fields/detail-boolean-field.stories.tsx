import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/BooleanField",
  component: DetailFields.DetailBooleanField,
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["text", "icon"],
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
} satisfies Meta<typeof DetailFields.DetailBooleanField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TrueText: Story = {
  name: "True (text)",
  args: {
    label: "Active",
    value: true,
    mode: "text",
  },
};

export const FalseText: Story = {
  name: "False (text)",
  args: {
    label: "Active",
    value: false,
    mode: "text",
  },
};

export const TrueIcon: Story = {
  name: "True (icon)",
  args: {
    label: "Verified",
    value: true,
    mode: "icon",
  },
};

export const FalseIcon: Story = {
  name: "False (icon)",
  args: {
    label: "Verified",
    value: false,
    mode: "icon",
  },
};

export const NullValue: Story = {
  args: {
    label: "Confirmed",
    value: null,
  },
};

export const CustomLabels: Story = {
  args: {
    label: "Enabled",
    value: true,
    mode: "text",
    labels: { true: "Enabled", false: "Disabled" },
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Status",
    value: null,
    fallback: "Not set",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Admin",
    value: true,
    layout: "inline",
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Email Verified",
    value: false,
    mode: "icon",
    layout: "left",
  },
};
