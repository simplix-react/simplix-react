import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/TimezoneField",
  component: FormFields.TimezoneField,
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
} satisfies Meta<typeof FormFields.TimezoneField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TimezoneField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Timezone",
    value: "",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "Asia/Seoul");
    return <FormFields.TimezoneField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Timezone",
    value: "Asia/Seoul",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TimezoneField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Timezone",
    value: "",
    error: "Please select a timezone",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TimezoneField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Timezone",
    value: "",
    description: "All scheduled events will use this timezone",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.TimezoneField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Timezone",
    value: "",
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "America/New_York");
    return <FormFields.TimezoneField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Timezone",
    value: "America/New_York",
    disabled: true,
  },
};
