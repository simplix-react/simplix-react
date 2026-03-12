import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem, Label } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="compact" id="compact" />
        <Label htmlFor="compact">Compact</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="comfortable" id="comfortable" />
        <Label htmlFor="comfortable">Comfortable</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="spacious" id="spacious" />
        <Label htmlFor="spacious">Spacious</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-a" disabled>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-a" id="opt-a" />
        <Label htmlFor="opt-a">Option A</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-b" id="opt-b" />
        <Label htmlFor="opt-b">Option B</Label>
      </div>
    </RadioGroup>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [plan, setPlan] = useState("starter");
    return (
      <div>
        <p style={{ fontSize: 14, marginBottom: 12 }}>Selected plan: {plan}</p>
        <RadioGroup value={plan} onValueChange={setPlan}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RadioGroupItem value="starter" id="starter" />
            <Label htmlFor="starter">Starter - $9/mo</Label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RadioGroupItem value="pro" id="pro" />
            <Label htmlFor="pro">Pro - $29/mo</Label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RadioGroupItem value="enterprise" id="enterprise" />
            <Label htmlFor="enterprise">Enterprise - $99/mo</Label>
          </div>
        </RadioGroup>
      </div>
    );
  },
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="left" className="flex gap-4" style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <RadioGroupItem value="left" id="align-left" />
        <Label htmlFor="align-left">Left</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <RadioGroupItem value="center" id="align-center" />
        <Label htmlFor="align-center">Center</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <RadioGroupItem value="right" id="align-right" />
        <Label htmlFor="align-right">Right</Label>
      </div>
    </RadioGroup>
  ),
};
