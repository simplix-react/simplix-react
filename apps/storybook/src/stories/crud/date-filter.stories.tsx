import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateFilter, SearchOperator } from "@simplix-react/ui";
import type { DateRange } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/DateFilter",
  component: DateFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof DateFilter>;

export default meta;

const dateOps: SearchOperator[] = [
  SearchOperator.EQUALS,
  SearchOperator.GREATER_THAN_OR_EQUAL,
  SearchOperator.LESS_THAN_OR_EQUAL,
  SearchOperator.BETWEEN,
];

export const Default: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Date | DateRange | undefined>(undefined);
    const [operator, setOperator] = useState<SearchOperator>(SearchOperator.EQUALS);
    return (
      <DateFilter
        label="Created"
        value={value}
        operator={operator}
        onChange={setValue}
        onOperatorChange={setOperator}
        operators={dateOps}
        defaultOperator={SearchOperator.EQUALS}
      />
    );
  },
};

export const SingleOperator: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Date | DateRange | undefined>(undefined);
    return (
      <DateFilter
        label="Due date"
        value={value}
        operator={SearchOperator.EQUALS}
        onChange={setValue}
        onOperatorChange={() => {}}
        operators={[SearchOperator.EQUALS]}
      />
    );
  },
};
