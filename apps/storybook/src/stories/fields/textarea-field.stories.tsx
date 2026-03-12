import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/TextareaField",
  component: FormFields.TextareaField,
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: () => {},
  },
  argTypes: {
    resize: {
      control: "select",
      options: ["none", "vertical", "both"],
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
} satisfies Meta<typeof FormFields.TextareaField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextareaField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Bio",
    value: "",
    placeholder: "Tell us about yourself",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "This is a sample bio text that spans multiple lines.\n\nIt demonstrates the textarea field component.");
    return <FormFields.TextareaField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Bio",
    value: "This is a sample bio text that spans multiple lines.\n\nIt demonstrates the textarea field component.",
    rows: 4,
  },
};

export const WithMaxLength: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextareaField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Description",
    value: "",
    maxLength: 500,
    description: "Maximum 500 characters",
    rows: 4,
  },
};

export const ResizeNone: Story = {
  name: "Resize: none",
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextareaField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Comment",
    value: "",
    resize: "none",
    rows: 3,
  },
};

export const ResizeBoth: Story = {
  name: "Resize: both",
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextareaField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Notes",
    value: "",
    resize: "both",
    rows: 3,
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextareaField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Description",
    value: "",
    error: "Description is required",
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "Disabled content");
    return <FormFields.TextareaField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Description",
    value: "Disabled content",
    disabled: true,
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TextareaField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Message",
    value: "",
    required: true,
    rows: 4,
    placeholder: "Enter your message",
  },
};
