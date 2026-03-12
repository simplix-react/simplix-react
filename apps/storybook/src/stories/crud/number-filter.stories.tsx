import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { NumberFilter, SearchOperator } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/NumberFilter",
  component: NumberFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof NumberFilter>;

export default meta;

const numberOps: SearchOperator[] = [
  SearchOperator.EQUALS,
  SearchOperator.GREATER_THAN,
  SearchOperator.LESS_THAN,
  SearchOperator.GREATER_THAN_OR_EQUAL,
  SearchOperator.LESS_THAN_OR_EQUAL,
];

export const Default: StoryObj = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(undefined);
    const [operator, setOperator] = useState<SearchOperator>(SearchOperator.EQUALS);
    return (
      <NumberFilter
        label="Price"
        value={value}
        operator={operator}
        onChange={setValue}
        onOperatorChange={setOperator}
        operators={numberOps}
        defaultOperator={SearchOperator.EQUALS}
      />
    );
  },
};

export const SingleOperator: StoryObj = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(undefined);
    return (
      <NumberFilter
        label="Quantity"
        value={value}
        operator={SearchOperator.EQUALS}
        onChange={setValue}
        onOperatorChange={() => {}}
        operators={[SearchOperator.EQUALS]}
      />
    );
  },
};
