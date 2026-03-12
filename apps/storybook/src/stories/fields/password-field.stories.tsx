import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/PasswordField",
  component: FormFields.PasswordField,
  tags: ["autodocs"],
  args: {
    value: "",
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
} satisfies Meta<typeof FormFields.PasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.PasswordField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Password",
    value: "",
    placeholder: "Enter password",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "secret123");
    return <FormFields.PasswordField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Password",
    value: "secret123",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.PasswordField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Password",
    value: "",
    error: "Password must be at least 8 characters",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.PasswordField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Password",
    value: "",
    description: "Must contain at least 8 characters, one uppercase letter, and one number",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.PasswordField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Password",
    value: "",
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "disabled");
    return <FormFields.PasswordField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Password",
    value: "disabled",
    disabled: true,
  },
};
