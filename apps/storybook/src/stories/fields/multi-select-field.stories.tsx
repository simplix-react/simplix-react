import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/MultiSelectField",
  component: FormFields.MultiSelectField,
  tags: ["autodocs"],
  args: {
    value: [],
    onChange: () => {},
    options: [],
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
} satisfies Meta<typeof FormFields.MultiSelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

const tagOptions = [
  { label: "React", value: "react" },
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "Node.js", value: "nodejs" },
  { label: "Python", value: "python" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Java", value: "java" },
];

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(args.value ?? []);
    return <FormFields.MultiSelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Skills",
    value: [],
    options: tagOptions,
    placeholder: "Select skills...",
  },
};

export const WithValues: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(args.value ?? ["react", "typescript"]);
    return <FormFields.MultiSelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Skills",
    value: ["react", "typescript"],
    options: tagOptions,
  },
};

export const WithMaxCount: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(args.value ?? ["react"]);
    return <FormFields.MultiSelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Top 3 Skills",
    value: ["react"],
    options: tagOptions,
    maxCount: 3,
    description: "Select up to 3 skills",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(args.value ?? []);
    return <FormFields.MultiSelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Skills",
    value: [],
    options: tagOptions,
    error: "Please select at least one skill",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(args.value ?? []);
    return <FormFields.MultiSelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Technologies",
    value: [],
    options: tagOptions,
    description: "Select all technologies you have experience with",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(args.value ?? []);
    return <FormFields.MultiSelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Skills",
    value: [],
    options: tagOptions,
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(args.value ?? ["react", "typescript"]);
    return <FormFields.MultiSelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Skills",
    value: ["react", "typescript"],
    options: tagOptions,
    disabled: true,
  },
};
