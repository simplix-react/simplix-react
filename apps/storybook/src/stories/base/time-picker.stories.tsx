import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TimePicker, type TimeValue } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 280, paddingBottom: 240 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    hour12: { control: "boolean" },
    minuteStep: { control: "number" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function TimePickerControlled(props: React.ComponentProps<typeof TimePicker>) {
  const [value, setValue] = useState<TimeValue | undefined>(props.value);
  return <TimePicker {...props} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: (args) => <TimePickerControlled {...args} />,
  args: {
    value: { hours: 10, minutes: 30 },
    onChange: () => {},
  },
};

export const Hour24: Story = {
  name: "24-Hour Clock",
  render: (args) => <TimePickerControlled {...args} />,
  args: {
    value: { hours: 14, minutes: 30 },
    onChange: () => {},
    hour12: false,
  },
};

export const MinuteStep: Story = {
  name: "5-Minute Step",
  render: (args) => <TimePickerControlled {...args} />,
  args: {
    value: { hours: 10, minutes: 30 },
    onChange: () => {},
    minuteStep: 5,
  },
};

export const WithMinMax: Story = {
  name: "With Min/Max Time",
  render: (args) => <TimePickerControlled {...args} />,
  args: {
    value: { hours: 12, minutes: 0 },
    onChange: () => {},
    minTime: { hours: 9, minutes: 30 },
    maxTime: { hours: 18, minutes: 15 },
  },
};

export const Empty: Story = {
  render: (args) => <TimePickerControlled {...args} />,
  args: {
    value: undefined,
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    value: { hours: 10, minutes: 30 },
    onChange: () => {},
    disabled: true,
  },
};
