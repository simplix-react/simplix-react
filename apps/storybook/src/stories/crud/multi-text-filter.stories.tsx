import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MultiTextFilter } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/MultiTextFilter",
  component: MultiTextFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof MultiTextFilter>;

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [values, setValues] = useState<Record<string, string>>({ name: "", email: "" });
    return (
      <MultiTextFilter
        fields={[
          { field: "name", label: "Name", placeholder: "Search by name..." },
          { field: "email", label: "Email", placeholder: "Search by email..." },
        ]}
        values={values}
        onChange={(field, value) => setValues((prev) => ({ ...prev, [field]: value }))}
      />
    );
  },
};

export const ThreeFields: StoryObj = {
  render: () => {
    const [values, setValues] = useState<Record<string, string>>({ name: "", email: "", phone: "" });
    return (
      <MultiTextFilter
        fields={[
          { field: "name", label: "Name" },
          { field: "email", label: "Email" },
          { field: "phone", label: "Phone" },
        ]}
        values={values}
        onChange={(field, value) => setValues((prev) => ({ ...prev, [field]: value }))}
      />
    );
  },
};
