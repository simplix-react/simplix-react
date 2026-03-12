import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ColorPicker } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
  argTypes: {
    showCustomPicker: { control: "boolean" },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "#3B82F6", onChange: () => {} },
  render: () => {
    const [color, setColor] = useState("#3B82F6");
    return <ColorPicker value={color} onChange={setColor} />;
  },
};

export const Empty: Story = {
  args: { value: "", onChange: () => {} },
  render: () => {
    const [color, setColor] = useState("");
    return <ColorPicker value={color} onChange={setColor} />;
  },
};

export const WithoutCustomPicker: Story = {
  name: "Without Custom Picker",
  args: { value: "#EF4444", onChange: () => {} },
  render: () => {
    const [color, setColor] = useState("#EF4444");
    return <ColorPicker value={color} onChange={setColor} showCustomPicker={false} />;
  },
};

export const NotClearable: Story = {
  name: "Not Clearable",
  args: { value: "#22C55E", onChange: () => {} },
  render: () => {
    const [color, setColor] = useState("#22C55E");
    return <ColorPicker value={color} onChange={setColor} clearable={false} />;
  },
};

export const Disabled: Story = {
  args: {
    value: "#6366F1",
    onChange: () => {},
    disabled: true,
  },
};

export const CustomPresets: Story = {
  name: "Custom Presets",
  args: { value: "#1E3A5F", onChange: () => {} },
  render: () => {
    const [color, setColor] = useState("#1E3A5F");
    return (
      <ColorPicker
        value={color}
        onChange={setColor}
        presetColors={[
          { value: "#1E3A5F", name: "Navy" },
          { value: "#2D5016", name: "Forest" },
          { value: "#5C1A1A", name: "Maroon" },
          { value: "#4A3728", name: "Brown" },
          { value: "#1A1A2E", name: "Midnight" },
          { value: "#0F3460", name: "Royal" },
          { value: "#533483", name: "Grape" },
          { value: "#E94560", name: "Coral" },
        ]}
      />
    );
  },
};
