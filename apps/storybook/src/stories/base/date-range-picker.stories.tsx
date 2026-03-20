import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateRangePicker } from "@simplix-react/ui";
import type { DateRange } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    numberOfMonths: { control: "select", options: [1, 2] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function DateRangePickerControlled(props: React.ComponentProps<typeof DateRangePicker>) {
  const [value, setValue] = useState<DateRange>(props.value);
  return <DateRangePicker {...props} value={value} onChange={setValue} />;
}

const today = new Date();
const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

export const Default: Story = {
  render: (args) => <DateRangePickerControlled {...args} />,
  args: {
    value: { from: weekAgo, to: today },
    onChange: () => {},
  },
};

export const Empty: Story = {
  render: (args) => <DateRangePickerControlled {...args} />,
  args: {
    value: { from: undefined, to: undefined },
    onChange: () => {},
  },
};

export const SingleMonth: Story = {
  name: "Single Month",
  render: (args) => <DateRangePickerControlled {...args} />,
  args: {
    value: { from: weekAgo, to: today },
    onChange: () => {},
    numberOfMonths: 1,
  },
};

export const Disabled: Story = {
  args: {
    value: { from: weekAgo, to: today },
    onChange: () => {},
    disabled: true,
  },
};
