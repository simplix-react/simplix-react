import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/StaticField",
  component: FormFields.StaticField,
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
} satisfies Meta<typeof FormFields.StaticField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Address",
    value: "123 Main Street, Suite 100",
  },
};

export const NumericValue: Story = {
  args: {
    label: "Port",
    value: 8080,
  },
};

export const NullValue: Story = {
  args: {
    label: "Middle Name",
    value: null,
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Notes",
    value: null,
    fallback: "N/A",
  },
};

export const WithChildren: Story = {
  render: (args) => (
    <FormFields.StaticField {...args}>
      <span style={{ color: "#22c55e", fontWeight: 600 }}>Online</span>
    </FormFields.StaticField>
  ),
  args: {
    label: "Status",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "OSDP Address",
    value: "0x7F",
    layout: "inline",
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Serial Number",
    value: "SN-2024-001234",
    layout: "left",
  },
};
