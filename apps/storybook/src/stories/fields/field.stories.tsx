import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/Field",
  component: FormFields.Field,
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
} satisfies Meta<typeof FormFields.Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Custom Widget",
    children: (
      <div style={{ padding: 12, border: "1px dashed #ccc", borderRadius: 6 }}>
        Custom content goes here
      </div>
    ),
  },
};

export const WithError: Story = {
  args: {
    label: "Upload",
    error: "File is required",
    children: (
      <div style={{ padding: 12, border: "1px dashed #ccc", borderRadius: 6 }}>
        Drag and drop files here
      </div>
    ),
  },
};

export const WithDescription: Story = {
  args: {
    label: "Custom Input",
    description: "This wraps any custom content with the standard field layout",
    children: (
      <div style={{ padding: 12, border: "1px dashed #ccc", borderRadius: 6 }}>
        Any React component can go here
      </div>
    ),
  },
};

export const Required: Story = {
  args: {
    label: "Required Custom Field",
    required: true,
    children: (
      <div style={{ padding: 12, border: "1px dashed #ccc", borderRadius: 6 }}>
        This is a required field
      </div>
    ),
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Field",
    disabled: true,
    children: (
      <div style={{ padding: 12, border: "1px dashed #ccc", borderRadius: 6, opacity: 0.5 }}>
        Disabled content
      </div>
    ),
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Widget",
    layout: "left",
    children: (
      <div style={{ padding: 12, border: "1px dashed #ccc", borderRadius: 6 }}>
        Left layout content
      </div>
    ),
  },
};
