import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NumberInput, Label } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "0" },
};

export const WithMinMax: Story = {
  name: "With Min/Max",
  args: { min: 0, max: 100, placeholder: "0-100" },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "N/A" },
};

export const WithLabel: Story = {
  name: "With Label",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Label htmlFor="quantity">Quantity</Label>
      <NumberInput id="quantity" min={1} max={99} placeholder="1" />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(5);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Label>Page size: {value}</Label>
        <NumberInput
          value={value}
          onChange={setValue}
          min={1}
          max={50}
        />
      </div>
    );
  },
};
