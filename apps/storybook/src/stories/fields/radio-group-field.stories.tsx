import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/RadioGroupField",
  component: FormFields.RadioGroupField,
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: () => {},
    options: [],
  },
  argTypes: {
    direction: {
      control: "select",
      options: ["column", "row"],
    },
    layout: {
      control: "select",
      options: ["top", "left", "inline", "hidden"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof FormFields.RadioGroupField>;

export default meta;
type Story = StoryObj<typeof meta>;

const planOptions = [
  { label: "Free", value: "free", description: "Basic features for personal use" },
  { label: "Pro", value: "pro", description: "Advanced features for professionals" },
  { label: "Enterprise", value: "enterprise", description: "Full features with dedicated support" },
];

const sizeOptions = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "free");
    return <FormFields.RadioGroupField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Plan",
    value: "free",
    options: planOptions,
  },
};

export const HorizontalLayout: Story = {
  name: "Direction: row",
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "md");
    return <FormFields.RadioGroupField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Size",
    value: "md",
    options: sizeOptions,
    direction: "row",
  },
};

export const WithDescriptions: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "pro");
    return <FormFields.RadioGroupField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Subscription Plan",
    value: "pro",
    options: planOptions,
    description: "Choose the plan that best fits your needs",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.RadioGroupField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Plan",
    value: "",
    options: planOptions,
    error: "Please select a plan",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.RadioGroupField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Priority",
    value: "",
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
    ],
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "pro");
    return <FormFields.RadioGroupField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Plan",
    value: "pro",
    options: planOptions,
    disabled: true,
  },
};
