import type { Meta, StoryObj } from "@storybook/react";
import { useState, useMemo, useCallback } from "react";
import {
  CrudListColumnContext,
  FilterBar,
  SearchOperator,
  type CrudListColumnContextValue,
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
    // Provide column context so the columns toggle renders, grouped with the
    // filter trigger in one segmented control (like the list/grid view toggle).
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
    const columnCtx = useMemo<CrudListColumnContextValue>(
      () => ({
        columns: [
          { field: "name", label: "Name" },
          { field: "status", label: "Status" },
          { field: "email", label: "Email" },
        ],
        setColumns: () => {},
        hiddenColumns,
        setHiddenColumns,
        isCardMode: false,
        setIsCardMode: () => {},
        viewMode: "list",
        setViewMode: () => {},
        canGridView: false,
        setCanGridView: () => {},
        responsiveCardMode: false,
        setResponsiveCardMode: () => {},
      }),
      [hiddenColumns],
    );
    return (
      <CrudListColumnContext.Provider value={columnCtx}>
        <FilterBar count={42} filters={textAndFacetedFilters} state={state} />
      </CrudListColumnContext.Provider>
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

/** A directory too large to send in one page, standing in for a server-backed list. */
const CUSTOMER_DIRECTORY = Array.from({ length: 2400 }, (_, i) => ({
  value: `c${i + 1}`,
  label: `${["Acme", "Globex", "Initech", "Umbrella", "Soylent", "Stark"][i % 6]} Holdings ${i + 1}`,
}));

const SERVER_PAGE_SIZE = 20;

/**
 * A faceted filter over a directory larger than any one page. Typing queries the
 * server (simulated with a delay) instead of filtering a preloaded list, and the
 * selection keeps its label once the results move past it.
 */
export const ServerSearchedFaceted: StoryObj = {
  render: () => {
    const state = useMockFilterState();
    const [options, setOptions] = useState(() => CUSTOMER_DIRECTORY.slice(0, SERVER_PAGE_SIZE));
    const [loading, setLoading] = useState(false);
    const [queries, setQueries] = useState<string[]>([]);

    const onSearch = useCallback((query: string) => {
      setQueries((prev) => [...prev, query === "" ? "(empty)" : query]);
      setLoading(true);
      const timer = setTimeout(() => {
        const lower = query.toLowerCase();
        setOptions(
          CUSTOMER_DIRECTORY.filter((o) => o.label.toLowerCase().includes(lower))
            .slice(0, SERVER_PAGE_SIZE),
        );
        setLoading(false);
      }, 250);
      return () => clearTimeout(timer);
    }, []);

    const selectedValues = (state.values["customerId.in"] as string[] | undefined) ?? [];
    const selectedOptions = CUSTOMER_DIRECTORY.filter((o) => selectedValues.includes(o.value));

    return (
      <div>
        <FilterBar
          maxBadges={3}
          filters={[
            {
              type: "faceted",
              field: "customerId",
              label: "Customer",
              display: "dropdown",
              options,
              onSearch,
              loading,
              selectedOptions,
            },
          ]}
          state={state}
        />
        <pre data-testid="server-queries" style={{ fontSize: 12, marginTop: 16 }}>
          {`directory: ${CUSTOMER_DIRECTORY.length} rows | page: ${options.length} rows\nqueries sent to the server: ${queries.join(" → ") || "(none yet)"}`}
        </pre>
      </div>
    );
  },
};
