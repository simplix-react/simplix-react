import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateRangeFilter } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/DateRangeFilter",
  component: DateRangeFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof DateRangeFilter>;

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [from, setFrom] = useState<Date | undefined>(undefined);
    const [to, setTo] = useState<Date | undefined>(undefined);
    return (
      <DateRangeFilter
        label="Created"
        from={from}
        to={to}
        onChange={(f, t) => { setFrom(f); setTo(t); }}
      />
    );
  },
};

export const WithPreselectedRange: StoryObj = {
  render: () => {
    const [from, setFrom] = useState<Date | undefined>(new Date(2024, 0, 1));
    const [to, setTo] = useState<Date | undefined>(new Date(2024, 0, 31));
    return (
      <DateRangeFilter
        label="Period"
        from={from}
        to={to}
        onChange={(f, t) => { setFrom(f); setTo(t); }}
      />
    );
  },
};
