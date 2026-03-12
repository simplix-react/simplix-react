import type { Meta, StoryObj } from "@storybook/react";
import { useState, useMemo, useCallback } from "react";
import {
  FilterBar,
  SearchOperator,
  type CrudListFilters,
  type FilterDef,
} from "@simplix-react/ui";

const meta = {
  title: "CRUD/Filters/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FilterBar>;

export default meta;

/** Minimal mock of CrudListFilters for storybook use. */
function useMockFilterState(
  initial?: Record<string, unknown>,
): CrudListFilters {
  const [search, setSearch] = useState("");
  const [values, setValuesState] = useState<Record<string, unknown>>(
    initial ?? {},
  );
  const [committed, setCommitted] = useState<Record<string, unknown>>(
    initial ?? {},
  );
  const [isPending, setIsPending] = useState(false);

  const setValue = useCallback(
    (key: string, value: unknown) => {
      setValuesState((prev) => ({ ...prev, [key]: value }));
      setIsPending(true);
    },
    [],
  );

  const setValues = useCallback(
    (updates: Record<string, unknown>) => {
      setValuesState((prev) => ({ ...prev, ...updates }));
      setIsPending(true);
    },
    [],
  );

  const setAll = useCallback(
    (filters: { search: string; values: Record<string, unknown> }) => {
      setSearch(filters.search);
      setValuesState(filters.values);
      setCommitted(filters.values);
      setIsPending(false);
    },
    [],
  );

  const clear = useCallback(() => {
    setSearch("");
    setValuesState({});
    setCommitted({});
    setIsPending(false);
  }, []);

  const apply = useCallback(() => {
    setCommitted(values);
    setIsPending(false);
  }, [values]);

  const commitValue = useCallback(
    (key: string, value: unknown) => {
      const updater = (prev: Record<string, unknown>) => ({
        ...prev,
        [key]: value,
      });
      setValuesState(updater);
      setCommitted(updater);
      setIsPending(false);
    },
    [],
  );

  const commitValues = useCallback(
    (updates: Record<string, unknown>) => {
      const updater = (prev: Record<string, unknown>) => ({
        ...prev,
        ...updates,
      });
      setValuesState(updater);
      setCommitted(updater);
      setIsPending(false);
    },
    [],
  );

  return useMemo(
    () => ({
      search,
      setSearch,
      values,
      setValue,
      setValues,
      setAll,
      clear,
      apply,
      isPending,
      committedValues: committed,
      commitValue,
      commitValues,
    }),
    [search, values, committed, isPending, setValue, setValues, setAll, clear, apply, commitValue, commitValues, setSearch],
  );
}

const textAndFacetedFilters: FilterDef[] = [
  {
    type: "text",
    field: "name",
    label: "Name",
    operators: [SearchOperator.CONTAINS, SearchOperator.EQUALS, SearchOperator.STARTS_WITH],
    defaultOperator: SearchOperator.CONTAINS,
    placeholder: "Search by name...",
  },
  {
    type: "faceted",
    field: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    type: "toggle",
    field: "verified",
    label: "Verified",
  },
];

export const Default: StoryObj = {
  render: () => {
    const state = useMockFilterState();
    return (
      <FilterBar
        filters={textAndFacetedFilters}
        state={state}
      />
    );
  },
};

const allFilterTypes: FilterDef[] = [
  {
    type: "text",
    field: "name",
    label: "Name",
    operators: [SearchOperator.CONTAINS, SearchOperator.EQUALS, SearchOperator.STARTS_WITH],
    defaultOperator: SearchOperator.CONTAINS,
  },
  {
    type: "number",
    field: "age",
    label: "Age",
    operators: [SearchOperator.EQUALS, SearchOperator.GREATER_THAN, SearchOperator.LESS_THAN],
    defaultOperator: SearchOperator.EQUALS,
  },
  {
    type: "faceted",
    field: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    type: "toggle",
    field: "verified",
    label: "Verified",
  },
  {
    type: "dateRange",
    field: "createdAt",
    label: "Created",
  },
];

export const AllFilterTypes: StoryObj = {
  render: () => {
    const state = useMockFilterState();
    return (
      <FilterBar
        filters={allFilterTypes}
        state={state}
      />
    );
  },
};

export const WithActiveFilters: StoryObj = {
  render: () => {
    const state = useMockFilterState({
      "name.contains": "Alice",
      "status.in": ["active", "pending"],
    });
    return (
      <FilterBar
        filters={textAndFacetedFilters}
        state={state}
      />
    );
  },
};

export const WithLeading: StoryObj = {
  render: () => {
    const state = useMockFilterState();
    return (
      <FilterBar
        filters={textAndFacetedFilters}
        state={state}
        leading={
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            5 results
          </span>
        }
      />
    );
  },
};

export const WithMaxBadges: StoryObj = {
  render: () => {
    const state = useMockFilterState({
      "name.contains": "Test",
      "status.in": ["active"],
      "verified.equals": true,
    });
    return (
      <FilterBar
        filters={textAndFacetedFilters}
        state={state}
        maxBadges={2}
      />
    );
  },
};
