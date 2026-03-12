import type { Meta, StoryObj } from "@storybook/react";
import { Label, Input, Checkbox } from "@simplix-react/ui";

const meta = {
  title: "Base/Controls/Label",
  component: Label,
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Email address" },
};

export const WithInput: Story = {
  name: "With Input",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 280 }}>
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="user@example.com" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  name: "With Checkbox",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 280 }}>
      <Label htmlFor="disabled-input">Disabled field</Label>
      <Input id="disabled-input" disabled placeholder="Cannot edit" />
    </div>
  ),
};
