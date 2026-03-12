import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/TextField",
  component: FormFields.TextField,
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: () => {},
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "url", "password", "tel"],
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
} satisfies Meta<typeof FormFields.TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Name",
    value: "",
    placeholder: "Enter your name",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "John Doe");
    return <FormFields.TextField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Name",
    value: "John Doe",
  },
};

export const EmailType: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Email",
    type: "email",
    placeholder: "user@example.com",
    value: "",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Email",
    type: "email",
    value: "",
    error: "This field is required",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Username",
    value: "",
    description: "Must be 3-20 characters, letters and numbers only",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Full Name",
    value: "",
    required: true,
    placeholder: "Required field",
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "Disabled value");
    return <FormFields.TextField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Name",
    value: "Disabled value",
    disabled: true,
  },
};

export const WithMaxLength: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Code",
    value: "",
    maxLength: 10,
    description: "Maximum 10 characters",
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Name",
    value: "",
    layout: "left",
    placeholder: "Enter your name",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Name",
    value: "",
    layout: "inline",
    placeholder: "Enter your name",
  },
};
