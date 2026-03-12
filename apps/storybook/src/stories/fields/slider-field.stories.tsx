import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/SliderField",
  component: FormFields.SliderField,
  tags: ["autodocs"],
  args: {
    value: 50,
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
} satisfies Meta<typeof FormFields.SliderField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? 50);
    return <FormFields.SliderField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Volume",
    value: 50,
    min: 0,
    max: 100,
  },
};

export const WithShowValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? 75);
    return <FormFields.SliderField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Brightness",
    value: 75,
    min: 0,
    max: 100,
    showValue: true,
  },
};

export const CustomRange: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? 5);
    return <FormFields.SliderField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Rating",
    value: 5,
    min: 1,
    max: 10,
    step: 1,
    showValue: true,
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? 30);
    return <FormFields.SliderField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Quality",
    value: 30,
    min: 0,
    max: 100,
    showValue: true,
    description: "Adjust the quality level (0 = lowest, 100 = highest)",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? 0);
    return <FormFields.SliderField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Priority",
    value: 0,
    min: 0,
    max: 10,
    error: "Priority must be greater than 0",
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? 60);
    return <FormFields.SliderField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Volume",
    value: 60,
    min: 0,
    max: 100,
    showValue: true,
    disabled: true,
  },
};
