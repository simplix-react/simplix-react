import type { Meta, StoryObj } from "@storybook/react";
import { useState, useMemo, useCallback } from "react";
import { ChipFilter, type CrudListFilters } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/ChipFilter",
  component: ChipFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
} satisfies Meta<typeof ChipFilter>;

export default meta;

/** Minimal mock of CrudListFilters for storybook use. */
function useMockFilterState(): CrudListFilters {
  const [search, setSearch] = useState("");
  const [values, setValuesState] = useState<Record<string, unknown>>({});

  const setValue = useCallback((key: string, value: unknown) => {
    setValuesState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setValues = useCallback((updates: Record<string, unknown>) => {
    setValuesState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setAll = useCallback((filters: { search: string; values: Record<string, unknown> }) => {
    setSearch(filters.search);
    setValuesState(filters.values);
  }, []);

  const clear = useCallback(() => {
    setSearch("");
    setValuesState({});
  }, []);

  return useMemo(() => ({
    search,
    setSearch,
    values,
    setValue,
    setValues,
    setAll,
    clear,
    apply: () => {},
    isPending: false,
    committedValues: values,
    commitValue: setValue,
    commitValues: setValues,
  }), [search, values, setValue, setValues, setAll, clear, setSearch]);
}

function StatusDot({ color }: { color: string }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color }} />;
}

export const Default: StoryObj = {
  render: () => {
    const state = useMockFilterState();
    return (
      <ChipFilter
        field="status.equals"
        state={state}
        columns={3}
        options={[
          { value: "active", label: "Active", icon: <StatusDot color="#22c55e" /> },
          { value: "pending", label: "Pending", icon: <StatusDot color="#f59e0b" /> },
          { value: "inactive", label: "Inactive", icon: <StatusDot color="#9ca3af" /> },
        ]}
      />
    );
  },
};

export const FourColumns: StoryObj = {
  render: () => {
    const state = useMockFilterState();
    return (
      <ChipFilter
        field="type.equals"
        state={state}
        columns={4}
        options={[
          { value: "annual", label: "Annual" },
          { value: "sick", label: "Sick" },
          { value: "personal", label: "Personal" },
          { value: "other", label: "Other" },
        ]}
      />
    );
  },
};

export const WithDisabled: StoryObj = {
  render: () => {
    const state = useMockFilterState();
    return (
      <ChipFilter
        field="priority.equals"
        state={state}
        columns={3}
        options={[
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low", disabled: true },
        ]}
      />
    );
  },
};
