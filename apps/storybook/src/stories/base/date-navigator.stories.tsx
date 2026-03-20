import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateNavigator } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/DateNavigator",
  component: DateNavigator,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "default"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof DateNavigator>;

export default meta;
type Story = StoryObj<typeof meta>;

function DateNavigatorControlled(props: React.ComponentProps<typeof DateNavigator>) {
  const [value, setValue] = useState<Date | undefined>(props.value ?? new Date());
  return <DateNavigator {...props} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: (args) => <DateNavigatorControlled {...args} />,
  args: {
    value: new Date(),
    onChange: () => {},
  },
};

export const Small: Story = {
  name: "Size: sm",
  render: (args) => <DateNavigatorControlled {...args} />,
  args: {
    value: new Date(),
    onChange: () => {},
    size: "sm",
  },
};

export const WithMaxDate: Story = {
  name: "With Max Date (Today)",
  render: (args) => <DateNavigatorControlled {...args} />,
  args: {
    value: new Date(),
    onChange: () => {},
    maxDate: new Date(),
  },
};

export const Disabled: Story = {
  args: {
    value: new Date(),
    onChange: () => {},
    disabled: true,
  },
};
