import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields, type TimeValue } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/TimeField",
  component: FormFields.TimeField,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 320, paddingBottom: 240 }}>
        <Story />
      </div>
    ),
  ],
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
    hour12: { control: "boolean" },
    minuteStep: { control: "number" },
  },
} satisfies Meta<typeof FormFields.TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

function TimeFieldControlled(props: React.ComponentProps<typeof FormFields.TimeField>) {
  const [value, setValue] = React.useState<TimeValue | null>(props.value);
  return <FormFields.TimeField {...props} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: (args) => <TimeFieldControlled {...args} />,
  args: {
    label: "Opening Time",
    value: { hours: 9, minutes: 30 },
  },
};

export const Hour24: Story = {
  name: "24-Hour Clock",
  render: (args) => <TimeFieldControlled {...args} />,
  args: {
    label: "Departure",
    value: { hours: 14, minutes: 30 },
    hour12: false,
  },
};

export const MinuteStep: Story = {
  name: "5-Minute Step",
  render: (args) => <TimeFieldControlled {...args} />,
  args: {
    label: "Reservation",
    value: { hours: 10, minutes: 30 },
    minuteStep: 5,
  },
};

export const WithMinMax: Story = {
  name: "With Min/Max Time",
  render: (args) => <TimeFieldControlled {...args} />,
  args: {
    label: "Business Hours",
    value: { hours: 12, minutes: 0 },
    minTime: { hours: 9, minutes: 30 },
    maxTime: { hours: 18, minutes: 15 },
    description: "09:30 - 18:15",
  },
};

export const WithError: Story = {
  render: (args) => <TimeFieldControlled {...args} />,
  args: {
    label: "Start Time",
    error: "Start time is required",
  },
};

export const Required: Story = {
  render: (args) => <TimeFieldControlled {...args} />,
  args: {
    label: "Start Time",
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Created At",
    value: { hours: 10, minutes: 30 },
    disabled: true,
  },
};
