import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/DateTimeField",
  component: FormFields.DateTimeField,
  tags: ["autodocs"],
  args: {
    value: null,
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
} satisfies Meta<typeof FormFields.DateTimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
    return <FormFields.DateTimeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Event Start",
    placeholder: "Select date and time",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(new Date("2024-06-15T14:30:00"));
    return <FormFields.DateTimeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Meeting Time",
  },
};

export const HideTime: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
    return <FormFields.DateTimeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Date Only",
    hideTime: true,
    description: "Time inputs are hidden",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
    return <FormFields.DateTimeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Deadline",
    error: "Deadline is required",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
    return <FormFields.DateTimeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Scheduled At",
    description: "All times are in your local timezone",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
    return <FormFields.DateTimeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Start Time",
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(new Date());
    return <FormFields.DateTimeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Created At",
    disabled: true,
  },
};
