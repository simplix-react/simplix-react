import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { UnifiedTextFilter, SearchOperator } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/UnifiedTextFilter",
  component: UnifiedTextFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
} satisfies Meta<typeof UnifiedTextFilter>;

export default meta;

const textOps: SearchOperator[] = [SearchOperator.CONTAINS, SearchOperator.EQUALS, SearchOperator.STARTS_WITH];

export const Default: StoryObj = {
  render: () => {
    const [selectedField, setSelectedField] = useState("name");
    const [value, setValue] = useState("");
    const [operator, setOperator] = useState<SearchOperator>(SearchOperator.CONTAINS);
    return (
      <UnifiedTextFilter
        fields={[
          { field: "name", label: "Name", operators: textOps, defaultOperator: SearchOperator.CONTAINS },
          { field: "email", label: "Email", operators: textOps, defaultOperator: SearchOperator.CONTAINS },
          { field: "phone", label: "Phone", operators: [SearchOperator.EQUALS], defaultOperator: SearchOperator.EQUALS },
        ]}
        selectedField={selectedField}
        value={value}
        operator={operator}
        onFieldChange={setSelectedField}
        onChange={setValue}
        onOperatorChange={setOperator}
      />
    );
  },
};
