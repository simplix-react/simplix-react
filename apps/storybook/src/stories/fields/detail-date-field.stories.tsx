import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/DateField",
  component: DetailFields.DetailDateField,
  tags: ["autodocs"],
  argTypes: {
    format: {
      control: "select",
      options: ["date", "datetime", "relative"],
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
} satisfies Meta<typeof DetailFields.DetailDateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DateFormat: Story = {
  name: "Format: date",
  args: {
    label: "Created",
    value: new Date("2024-06-15"),
    format: "date",
  },
};

export const DateTimeFormat: Story = {
  name: "Format: datetime",
  args: {
    label: "Last Login",
    value: new Date("2024-06-15T14:30:00"),
    format: "datetime",
  },
};

export const RelativeFormat: Story = {
  name: "Format: relative",
  args: {
    label: "Updated",
    value: new Date(Date.now() - 2 * 60 * 60 * 1000),
    format: "relative",
  },
};

export const ISOString: Story = {
  args: {
    label: "Registered",
    value: "2024-01-15T09:00:00Z",
    format: "datetime",
  },
};

export const NullValue: Story = {
  args: {
    label: "Deleted At",
    value: null,
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Expires",
    value: null,
    fallback: "Never",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Created",
    value: new Date("2024-06-15"),
    layout: "inline",
  },
};
