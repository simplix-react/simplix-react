import type { Meta, StoryObj } from "@storybook/react";
import { BooleanBadge } from "@simplix-react/ui";

const meta = {
  title: "Base/Display/BooleanBadge",
  component: BooleanBadge,
  tags: ["autodocs"],
  argTypes: {
    value: { control: "boolean" },
    trueVariant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning", "green", "blue"],
    },
    falseVariant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning", "red", "slate"],
    },
  },
} satisfies Meta<typeof BooleanBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const True: Story = {
  args: { value: true },
};

export const False: Story = {
  args: { value: false },
};

export const NullValue: Story = {
  name: "Null Value",
  args: { value: null },
};

export const CustomVariants: Story = {
  name: "Custom Variants",
  args: {
    value: true,
    trueVariant: "blue",
    falseVariant: "red",
  },
};

export const Comparison: Story = {
  name: "True vs False",
  args: { value: true },
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <span style={{ fontSize: 14 }}>Active:</span>
      <BooleanBadge value={true} />
      <span style={{ fontSize: 14 }}>Inactive:</span>
      <BooleanBadge value={false} />
    </div>
  ),
};
