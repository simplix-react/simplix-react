import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/TextField",
  component: DetailFields.DetailTextField,
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
} satisfies Meta<typeof DetailFields.DetailTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Name",
    value: "John Doe",
  },
};

export const NullValue: Story = {
  args: {
    label: "Middle Name",
    value: null,
  },
};

export const EmptyString: Story = {
  args: {
    label: "Nickname",
    value: "",
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Notes",
    value: null,
    fallback: "N/A",
  },
};

export const Copyable: Story = {
  args: {
    label: "Email",
    value: "jane@example.com",
    copyable: true,
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Username",
    value: "jdoe",
    layout: "inline",
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Department",
    value: "Engineering",
    layout: "left",
  },
};
