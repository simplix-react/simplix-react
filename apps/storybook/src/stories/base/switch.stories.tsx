import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Switch, Label } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: { checked: true },
};

export const Small: Story = {
  args: { size: "sm" },
};

export const SmallChecked: Story = {
  name: "Small + Checked",
  args: { size: "sm", checked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  name: "Disabled + Checked",
  args: { disabled: true, checked: true },
};

export const WithLabel: Story = {
  name: "With Label",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane Mode</Label>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Switch checked={checked} onCheckedChange={setChecked} id="dark-mode" />
        <Label htmlFor="dark-mode">
          Dark mode is {checked ? "on" : "off"}
        </Label>
      </div>
    );
  },
};

export const SizeComparison: Story = {
  name: "Size Comparison",
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Switch size="sm" defaultChecked />
        <Label>Small</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Switch defaultChecked />
        <Label>Default</Label>
      </div>
    </div>
  ),
};
