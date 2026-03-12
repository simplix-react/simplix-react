import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AdvancedSelectFilter, SearchOperator } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/AdvancedSelectFilter",
  component: AdvancedSelectFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AdvancedSelectFilter>;

export default meta;

const options = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

const selectOps: SearchOperator[] = [SearchOperator.IN, SearchOperator.NOT_IN, SearchOperator.EQUALS];

export const Default: StoryObj = {
  render: () => {
    const [value, setValue] = useState<string | string[]>([]);
    const [operator, setOperator] = useState<SearchOperator>(SearchOperator.IN);
    return (
      <AdvancedSelectFilter
        label="Status"
        value={value}
        operator={operator}
        onChange={setValue}
        onOperatorChange={setOperator}
        operators={selectOps}
        options={options}
      />
    );
  },
};

export const WithPreselected: StoryObj = {
  render: () => {
    const [value, setValue] = useState<string | string[]>(["active", "pending"]);
    const [operator, setOperator] = useState<SearchOperator>(SearchOperator.IN);
    return (
      <AdvancedSelectFilter
        label="Status"
        value={value}
        operator={operator}
        onChange={setValue}
        onOperatorChange={setOperator}
        operators={selectOps}
        options={options}
      />
    );
  },
};
