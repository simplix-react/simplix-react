import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/DateField",
  component: FormFields.DateField,
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
} satisfies Meta<typeof FormFields.DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(
      args.value ? new Date(args.value as string | number) : null,
    );
    return <FormFields.DateField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Date",
    value: null,
    placeholder: "Select a date",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(new Date("2024-06-15"));
    return <FormFields.DateField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Birth Date",
  },
};

export const WithMinMaxDate: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
    return <FormFields.DateField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Appointment Date",
    maxDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    minDate: new Date(),
    description: "Select a date within the next 90 days",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
    return <FormFields.DateField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Start Date",
    error: "Start date is required",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
    return <FormFields.DateField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Event Date",
    description: "The event will be scheduled on this date",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
    return <FormFields.DateField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Due Date",
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(new Date());
    return <FormFields.DateField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Created Date",
    disabled: true,
  },
};

export const ReverseYears: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null);
    return <FormFields.DateField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Birth Date",
    reverseYears: true,
    startYear: 1950,
    endYear: new Date().getFullYear(),
    description: "Year dropdown shown in reverse order",
  },
};
