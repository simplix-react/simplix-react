import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/NumberField",
  component: FormFields.NumberField,
  tags: ["autodocs"],
  args: {
    value: null,
    onChange: () => {},
  },
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
} satisfies Meta<typeof FormFields.NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(args.value ?? null);
    return <FormFields.NumberField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Quantity",
    value: null,
    placeholder: "Enter a number",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(args.value ?? 42);
    return <FormFields.NumberField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Age",
    value: 42,
  },
};

export const WithMinMax: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(args.value ?? null);
    return <FormFields.NumberField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Age",
    value: null,
    min: 0,
    max: 150,
    description: "Must be between 0 and 150",
  },
};

export const WithStep: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(args.value ?? 0);
    return <FormFields.NumberField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Price",
    value: 0,
    step: 0.01,
    min: 0,
    placeholder: "0.00",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(args.value ?? null);
    return <FormFields.NumberField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Quantity",
    value: null,
    error: "This field is required",
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(args.value ?? 100);
    return <FormFields.NumberField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Quantity",
    value: 100,
    disabled: true,
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(args.value ?? null);
    return <FormFields.NumberField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Amount",
    value: null,
    required: true,
    placeholder: "Enter amount",
  },
};
