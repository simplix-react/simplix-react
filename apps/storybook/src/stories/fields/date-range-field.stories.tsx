import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";
import type { DateRange } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/DateRangeField",
  component: FormFields.DateRangeField,
  tags: ["autodocs"],
  args: {
    value: { from: undefined, to: undefined },
    onChange: () => {},
  },
  argTypes: {
    numberOfMonths: {
      control: "select",
      options: [1, 2],
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
} satisfies Meta<typeof FormFields.DateRangeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<DateRange>(
      args.value ?? { from: undefined, to: undefined },
    );
    return <FormFields.DateRangeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Period",
    value: { from: undefined, to: undefined },
    placeholder: "Select date range",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<DateRange>({
      from: new Date("2024-06-01"),
      to: new Date("2024-06-30"),
    });
    return <FormFields.DateRangeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Reporting Period",
  },
};

export const SingleMonth: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<DateRange>({ from: undefined, to: undefined });
    return <FormFields.DateRangeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Period",
    numberOfMonths: 1,
    description: "Single month calendar view",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<DateRange>({ from: undefined, to: undefined });
    return <FormFields.DateRangeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Period",
    error: "Please select a date range",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<DateRange>({ from: undefined, to: undefined });
    return <FormFields.DateRangeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Vacation",
    description: "Select your vacation dates",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<DateRange>({ from: undefined, to: undefined });
    return <FormFields.DateRangeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Billing Period",
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<DateRange>({
      from: new Date("2024-01-01"),
      to: new Date("2024-12-31"),
    });
    return <FormFields.DateRangeField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Fiscal Year",
    disabled: true,
  },
};
