import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, Label } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "select",
      options: [true, false, "indeterminate"],
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  name: "Disabled + Checked",
  args: { checked: true, disabled: true },
};

export const WithLabel: Story = {
  name: "With Label",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="newsletter" />
      <Label htmlFor="newsletter">Subscribe to newsletter</Label>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox
          id="agree"
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
        />
        <Label htmlFor="agree">I agree to the privacy policy</Label>
      </div>
    );
  },
};

export const CheckboxGroup: Story = {
  name: "Checkbox Group",
  render: () => {
    const [selected, setSelected] = useState<string[]>(["email"]);
    const toggle = (id: string) =>
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
      );
    const items = [
      { id: "email", label: "Email notifications" },
      { id: "sms", label: "SMS notifications" },
      { id: "push", label: "Push notifications" },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Checkbox
              id={item.id}
              checked={selected.includes(item.id)}
              onCheckedChange={() => toggle(item.id)}
            />
            <Label htmlFor={item.id}>{item.label}</Label>
          </div>
        ))}
      </div>
    );
  },
};
