import type { Meta, StoryObj } from "@storybook/react";
import { useState, useMemo, useCallback } from "react";
import {
  Badge,
  CrudList,
  FilterBar,
  SearchOperator,
  type CrudListFilters,
  type FilterDef,
} from "@simplix-react/ui";

const meta = {
  title: "Recipes/FilterBar Patterns",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

// ── Mock filter state ──

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

// ── Filter definitions ──

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
      { value: "ACTIVE", label: "Active" },
      { value: "PENDING", label: "Pending" },
      { value: "SUSPENDED", label: "Suspended" },
      { value: "EXPIRED", label: "Expired" },
    ],
  },
];

const fullFilterSet: FilterDef[] = [
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
      { value: "ACTIVE", label: "Active" },
      { value: "PENDING", label: "Pending" },
      { value: "SUSPENDED", label: "Suspended" },
      { value: "EXPIRED", label: "Expired" },
    ],
  },
  {
    type: "toggle",
    field: "isVip",
    label: "VIP Only",
  },
  {
    type: "dateRange",
    field: "createdAt",
    label: "Created",
  },
  {
    type: "number",
    field: "displayOrder",
    label: "Order",
    operators: [SearchOperator.EQUALS, SearchOperator.GREATER_THAN, SearchOperator.LESS_THAN],
    defaultOperator: SearchOperator.EQUALS,
  },
];

// ── Stories ──

export const TextAndFaceted: StoryObj = {
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

export const FullFilterSet: StoryObj = {
  render: () => {
    const state = useMockFilterState();
    return (
      <FilterBar
        filters={fullFilterSet}
        state={state}
      />
    );
  },
};

export const WithLeadingCount: StoryObj = {
  render: () => {
    const state = useMockFilterState();
    return (
      <FilterBar
        filters={textAndFacetedFilters}
        state={state}
        leading={
          <Badge variant="secondary" className="text-xs">
            128 results
          </Badge>
        }
      />
    );
  },
};

export const ChipFilterQuickSelect: StoryObj = {
  render: () => {
    const state = useMockFilterState();
    return (
      <CrudList>
        <CrudList.ChipFilter
          field="acknowledged.equals"
          state={state}
          columns={2}
          options={[
            {
              value: "true",
              label: "Acknowledged",
              icon: (
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ),
            },
            {
              value: "false",
              label: "Unacknowledged",
              icon: (
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              ),
            },
          ]}
        />
      </CrudList>
    );
  },
};
