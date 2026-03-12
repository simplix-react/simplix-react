import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/DetailField",
  component: DetailFields.DetailField,
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
} satisfies Meta<typeof DetailFields.DetailField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Permissions",
    children: (
      <div style={{ display: "flex", gap: 4 }}>
        <span>Read</span>
        <span>Write</span>
        <span>Execute</span>
      </div>
    ),
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "ID",
    layout: "inline",
    children: <span>usr_12345</span>,
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Category",
    layout: "left",
    children: <span>Technology</span>,
  },
};

export const SizeLg: Story = {
  name: "Size: lg",
  args: {
    label: "Full Name",
    size: "lg",
    children: <span>Jane Cooper</span>,
  },
};
