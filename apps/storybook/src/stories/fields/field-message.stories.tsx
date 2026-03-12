import type { Meta, StoryObj } from "@storybook/react";
import { FieldMessage } from "@simplix-react/ui";

const meta = {
  title: "Fields/Shared/FieldMessage",
  component: FieldMessage,
  tags: ["autodocs"],
  args: {
    children: "",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["error", "warning", "info", "description"],
    },
  },
} satisfies Meta<typeof FieldMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: {
    variant: "error",
    children: "This field is required",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "SCP Number already in use",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    children: "Range: 1-1024",
  },
};

export const Description: Story = {
  args: {
    variant: "description",
    children: "Must be 3-20 characters, letters and numbers only",
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <FieldMessage variant="error">Error: This field is required</FieldMessage>
      <FieldMessage variant="warning">Warning: Value may conflict</FieldMessage>
      <FieldMessage variant="info">Info: Range 1-1024</FieldMessage>
      <FieldMessage variant="description">Description: Help text for the field</FieldMessage>
    </div>
  ),
};
