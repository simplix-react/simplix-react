import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/SwitchField",
  component: FormFields.SwitchField,
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
} satisfies Meta<typeof FormFields.SwitchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? false);
    return <FormFields.SwitchField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Notifications",
    value: false,
  },
};

export const On: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? true);
    return <FormFields.SwitchField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Notifications",
    value: true,
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? false);
    return <FormFields.SwitchField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Email Notifications",
    value: false,
    description: "Receive email notifications for important updates",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? false);
    return <FormFields.SwitchField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Two-Factor Authentication",
    value: false,
    error: "Two-factor authentication must be enabled",
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? true);
    return <FormFields.SwitchField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Dark Mode",
    value: true,
    disabled: true,
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? false);
    return <FormFields.SwitchField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Accept Terms",
    value: false,
    required: true,
  },
};
