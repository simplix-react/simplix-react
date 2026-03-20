import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    reverseYears: { control: "boolean" },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function DatePickerControlled(props: React.ComponentProps<typeof DatePicker>) {
  const [value, setValue] = useState<Date | undefined>(props.value);
  return <DatePicker {...props} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: (args) => <DatePickerControlled {...args} />,
  args: {
    value: new Date(),
    onChange: () => {},
  },
};

export const Empty: Story = {
  render: (args) => <DatePickerControlled {...args} />,
  args: {
    value: undefined,
    onChange: () => {},
    placeholder: "Select a date",
  },
};

export const NotClearable: Story = {
  name: "Not Clearable",
  render: (args) => <DatePickerControlled {...args} />,
  args: {
    value: new Date(),
    onChange: () => {},
    clearable: false,
  },
};

export const Disabled: Story = {
  args: {
    value: new Date(),
    onChange: () => {},
    disabled: true,
  },
};

export const WithMinMax: Story = {
  name: "With Min/Max Date",
  render: (args) => <DatePickerControlled {...args} />,
  args: {
    value: new Date(),
    onChange: () => {},
    minDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    maxDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  },
};
