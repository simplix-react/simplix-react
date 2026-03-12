import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FacetedFilter } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/FacetedFilter",
  component: FacetedFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof FacetedFilter>;

export default meta;

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

const priorityOptions = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export const MultiSelect: StoryObj = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <FacetedFilter
        label="Status"
        value={value}
        onChange={(v) => setValue(v as string[])}
        options={statusOptions}
      />
    );
  },
};

export const SingleSelect: StoryObj = {
  render: () => {
    const [value, setValue] = useState<string>("");
    return (
      <FacetedFilter
        label="Priority"
        value={value}
        onChange={(v) => setValue(v as string)}
        options={priorityOptions}
        multiSelect={false}
      />
    );
  },
};

export const WithPreselected: StoryObj = {
  render: () => {
    const [value, setValue] = useState<string[]>(["active", "pending"]);
    return (
      <FacetedFilter
        label="Status"
        value={value}
        onChange={(v) => setValue(v as string[])}
        options={statusOptions}
      />
    );
  },
};

export const ManyOptions: StoryObj = {
  render: () => {
    const [value, setValue] = useState<string[]>(["critical", "high", "medium", "low"]);
    const manyOptions = [
      ...priorityOptions,
      { label: "Trivial", value: "trivial" },
      { label: "Blocker", value: "blocker" },
    ];
    return (
      <FacetedFilter
        label="Priority"
        value={value}
        onChange={(v) => setValue(v as string[])}
        options={manyOptions}
        maxDisplayCount={3}
      />
    );
  },
};
