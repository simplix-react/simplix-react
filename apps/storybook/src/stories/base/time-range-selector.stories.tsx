import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TimeRangeSelector } from "@simplix-react/ui";
import type { TimeRangeValue } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/TimeRangeSelector",
  component: TimeRangeSelector,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 1100 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    colorTheme: {
      control: "select",
      options: ["slate", "blue", "emerald", "violet", "amber", "rose"],
    },
  },
} satisfies Meta<typeof TimeRangeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = new Date();
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

async function mockFetchCounts(_from: Date, _to: Date, bucketCount: number): Promise<number[]> {
  return Array.from({ length: bucketCount }, () => Math.floor(Math.random() * 50));
}

function TimeRangeSelectorControlled(props: React.ComponentProps<typeof TimeRangeSelector>) {
  const [value, setValue] = useState({ from: props.value.from, to: props.value.to });
  return (
    <TimeRangeSelector
      {...props}
      value={value}
      onChange={(range: TimeRangeValue) => setValue({ from: range.from, to: range.to })}
    />
  );
}

export const Default: Story = {
  render: (args) => <TimeRangeSelectorControlled {...args} />,
  args: {
    value: { from: startOfDay, to: endOfDay },
    onChange: () => {},
    fetchCounts: mockFetchCounts,
  },
};

export const HourWindow: Story = {
  name: "1 Hour Window",
  render: (args) => <TimeRangeSelectorControlled {...args} />,
  args: {
    value: { from: new Date(now.getTime() - 3600000), to: now },
    onChange: () => {},
    fetchCounts: mockFetchCounts,
    defaultWindow: "1h",
  },
};

export const WeekWindow: Story = {
  name: "7 Day Window",
  render: (args) => <TimeRangeSelectorControlled {...args} />,
  args: {
    value: { from: new Date(now.getTime() - 7 * 86400000), to: now },
    onChange: () => {},
    fetchCounts: mockFetchCounts,
    defaultWindow: "7d",
  },
};

export const CustomPresets: Story = {
  name: "Custom Presets",
  render: (args) => <TimeRangeSelectorControlled {...args} />,
  args: {
    value: { from: startOfDay, to: endOfDay },
    onChange: () => {},
    fetchCounts: mockFetchCounts,
    presets: [
      { key: "1h", label: "1h", windowMinutes: 60, bucketMinutes: 5 },
      { key: "6h", label: "6h", windowMinutes: 360, bucketMinutes: 15 },
      { key: "1d", label: "1d", windowMinutes: 1440, bucketMinutes: 60 },
    ],
  },
};
