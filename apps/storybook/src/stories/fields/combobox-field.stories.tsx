import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/ComboboxField",
  component: FormFields.ComboboxField,
  tags: ["autodocs"],
  args: {
    value: null,
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
} satisfies Meta<typeof FormFields.ComboboxField>;

export default meta;
type Story = StoryObj<typeof meta>;

const frameworkOptions = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
  { label: "Next.js", value: "nextjs" },
  { label: "Nuxt", value: "nuxt" },
  { label: "Remix", value: "remix" },
  { label: "Astro", value: "astro" },
];

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(args.value ?? null);
    return <FormFields.ComboboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Framework",
    value: null,
    options: frameworkOptions,
    placeholder: "Select a framework",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(args.value ?? "react");
    return <FormFields.ComboboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Framework",
    value: "react",
    options: frameworkOptions,
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(args.value ?? null);
    return <FormFields.ComboboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Framework",
    value: null,
    options: frameworkOptions,
    error: "Please select a framework",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(args.value ?? null);
    return <FormFields.ComboboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Framework",
    value: null,
    options: frameworkOptions,
    description: "Search and select a JavaScript framework",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(args.value ?? null);
    return <FormFields.ComboboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Framework",
    value: null,
    options: frameworkOptions,
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(args.value ?? "vue");
    return <FormFields.ComboboxField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Framework",
    value: "vue",
    options: frameworkOptions,
    disabled: true,
  },
};

export const Loading: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(null);
    return <FormFields.ComboboxField {...args} value={value} onChange={setValue} loading />;
  },
  args: {
    label: "Framework",
    options: [],
  },
};
