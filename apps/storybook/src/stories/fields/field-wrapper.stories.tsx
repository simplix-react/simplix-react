import type { Meta, StoryObj } from "@storybook/react";
import { FieldWrapper } from "@simplix-react/ui";

const meta = {
  title: "Fields/Shared/FieldWrapper",
  component: FieldWrapper,
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
} satisfies Meta<typeof FieldWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleInput = (
  <input
    type="text"
    placeholder="Sample input"
    style={{
      width: "100%",
      padding: "6px 12px",
      border: "1px solid #e2e8f0",
      borderRadius: 6,
      fontSize: 14,
    }}
  />
);

export const LayoutTop: Story = {
  name: "Layout: top (default)",
  args: {
    label: "Email",
    layout: "top",
    children: sampleInput,
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Email",
    layout: "left",
    children: sampleInput,
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Email",
    layout: "inline",
    children: sampleInput,
  },
};

export const LayoutHidden: Story = {
  name: "Layout: hidden",
  args: {
    label: "Email",
    layout: "hidden",
    children: sampleInput,
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    error: "Invalid email address",
    children: sampleInput,
  },
};

export const WithWarning: Story = {
  args: {
    label: "Port",
    warning: "Port number is already in use",
    children: sampleInput,
  },
};

export const WithDescription: Story = {
  args: {
    label: "Username",
    description: "Must be 3-20 characters, letters and numbers only",
    children: sampleInput,
  },
};

export const WithErrorAndDescription: Story = {
  args: {
    label: "Email",
    error: "This field is required",
    description: "We will never share your email",
    children: sampleInput,
  },
};

export const Required: Story = {
  args: {
    label: "Full Name",
    required: true,
    children: sampleInput,
  },
};

export const Disabled: Story = {
  args: {
    label: "Locked Field",
    disabled: true,
    children: sampleInput,
  },
};

export const SizeSm: Story = {
  name: "Size: sm",
  args: {
    label: "Small",
    size: "sm",
    children: sampleInput,
  },
};

export const SizeMd: Story = {
  name: "Size: md",
  args: {
    label: "Medium",
    size: "md",
    children: sampleInput,
  },
};

export const SizeLg: Story = {
  name: "Size: lg",
  args: {
    label: "Large",
    size: "lg",
    children: sampleInput,
  },
};
