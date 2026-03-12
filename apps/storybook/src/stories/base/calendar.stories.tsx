import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@simplix-react/ui";
import type { DateRange } from "@simplix-react/ui";

const meta = {
  title: "Base/Controls/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "range"],
    },
    numberOfMonths: {
      control: { type: "number", min: 1, max: 3 },
    },
    hideNavigation: { control: "boolean" },
    hideHeader: { control: "boolean" },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithSelectedDate: Story = {
  name: "With Selected Date",
  render: () => {
    const [date, setDate] = useState<Date>(new Date(2025, 5, 15));
    return <Calendar selected={date} onSelect={setDate} />;
  },
};

export const WithMinMaxDate: Story = {
  name: "With Min/Max Constraints",
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return (
      <Calendar
        selected={date}
        onSelect={(d) => setDate(d)}
        minDate={minDate}
        maxDate={maxDate}
      />
    );
  },
};

export const RangeMode: Story = {
  name: "Range Mode",
  render: () => {
    const [range, setRange] = useState<DateRange>({
      from: undefined,
      to: undefined,
    });
    return (
      <Calendar
        mode="range"
        selectedRange={range}
        onSelectRange={setRange}
      />
    );
  },
};

export const TwoMonths: Story = {
  name: "Two Months",
  render: () => {
    const [range, setRange] = useState<DateRange>({
      from: undefined,
      to: undefined,
    });
    return (
      <Calendar
        mode="range"
        numberOfMonths={2}
        selectedRange={range}
        onSelectRange={setRange}
      />
    );
  },
};

export const HiddenNavigation: Story = {
  name: "Hidden Navigation",
  args: { hideNavigation: true },
};

export const HiddenHeader: Story = {
  name: "Hidden Header",
  args: { hideHeader: true },
};
