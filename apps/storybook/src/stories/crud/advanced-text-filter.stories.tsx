import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AdvancedTextFilter, SearchOperator } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/AdvancedTextFilter",
  component: AdvancedTextFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof AdvancedTextFilter>;

export default meta;

const textOperators: SearchOperator[] = [SearchOperator.CONTAINS, SearchOperator.EQUALS, SearchOperator.STARTS_WITH, SearchOperator.ENDS_WITH];

export const Default: StoryObj = {
  render: () => {
    const [value, setValue] = useState("");
    const [operator, setOperator] = useState<SearchOperator>(SearchOperator.CONTAINS);
    return (
      <AdvancedTextFilter
        label="Name"
        value={value}
        operator={operator}
        onChange={setValue}
        onOperatorChange={setOperator}
        operators={textOperators}
        defaultOperator={SearchOperator.CONTAINS}
      />
    );
  },
};

export const SingleOperator: StoryObj = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <AdvancedTextFilter
        label="Search"
        value={value}
        operator={SearchOperator.CONTAINS}
        onChange={setValue}
        onOperatorChange={() => {}}
        operators={[SearchOperator.CONTAINS]}
      />
    );
  },
};
