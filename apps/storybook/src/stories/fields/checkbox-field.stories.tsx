import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/CheckboxField",
  component: FormFields.CheckboxField,
  tags: ["autodocs"],
  args: {
    value: false,
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
} satisfies Meta<typeof FormFields.CheckboxField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? false);
    return <FormFields.CheckboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Accept terms and conditions",
    value: false,
  },
};

export const Checked: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? true);
    return <FormFields.CheckboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Accept terms and conditions",
    value: true,
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? false);
    return <FormFields.CheckboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Accept terms and conditions",
    value: false,
    error: "You must accept the terms",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? false);
    return <FormFields.CheckboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Subscribe to newsletter",
    value: false,
    description: "We will send you weekly updates about new features",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? false);
    return <FormFields.CheckboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "I agree to the privacy policy",
    value: false,
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? true);
    return <FormFields.CheckboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Feature enabled",
    value: true,
    disabled: true,
  },
};
