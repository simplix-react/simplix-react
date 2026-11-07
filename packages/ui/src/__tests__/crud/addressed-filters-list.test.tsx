// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode, useMemo, useSyncExternalStore } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: "en", exists: () => true }),
  useLocale: () => "en",
}));

vi.mock("../../crud/shared/column-context", () => ({
  useCrudListColumns: () => null,
}));

import { flatSearch } from "../../adapters/tanstack-router";
import { FilterBar, type FilterDef } from "../../crud/filters/filter-bar";
import { adaptForcedList, forcedScope } from "../../crud/entity/forced-list";
import { adaptOrvalList } from "../../crud/list/adapt-orval-list";
import { filtersToRequestParams } from "../../crud/list/list-search-params";
import { useCrudList } from "../../crud/list/use-crud-list";
import { validateCrudSearch, type CrudNavigateOptions, type CrudSearch } from "../../crud/patterns/crud-search";
import { useCrudNavigation } from "../../crud/patterns/use-crud-page";

afterEach(cleanup);

/**
 * A router that keeps a history of addresses and records each move as a push or a replace, the way
 * a browser history does. The address is written and read with `flatSearch`, so the test covers
 * what reaches the address bar and what the route's `validateSearch` is handed back.
 * `@tanstack/react-router` is not a dependency of this package, so its `navigate({ search,
 * replace })` is stood in for by `navigate`.
 */
function createMemoryRouter(initial: string) {
  const entries = [initial];
  let index = 0;
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) listener();
  };
  return {
    get length() {
      return entries.length;
    },
    get address() {
      return entries[index] ?? "";
    },
    navigate(search: CrudSearch, options?: CrudNavigateOptions) {
      const next = flatSearch.stringifySearch({ ...search });
      if (options?.replace) {
        entries[index] = next;
      } else {
        entries.splice(index + 1);
        entries.push(next);
        index += 1;
      }
      notify();
    },
    back() {
      index -= 1;
      notify();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
type MemoryRouter = ReturnType<typeof createMemoryRouter>;

/** What a route's `validateSearch: validateCrudSearch` hands the page for the router's address. */
function useRouteSearch(router: MemoryRouter): CrudSearch {
  const address = useSyncExternalStore(router.subscribe, () => router.address);
  return useMemo(() => validateCrudSearch(flatSearch.parseSearch(address)), [address]);
}

const CONTROLS: FilterDef[] = [
  {
    type: "faceted",
    field: "status",
    label: "Status",
    options: [
      { value: "FAILED", label: "Failed" },
      { value: "PAUSED", label: "Paused" },
    ],
  },
  { type: "toggle", field: "active", label: "Active" },
];

/** The generated list read: records the parameters each request carries. */
const read = vi.fn((_params: Record<string, unknown>, _options: unknown) => ({
  data: { content: [], totalElements: 0 },
  isLoading: false,
  error: null,
}));
const useJobs = adaptOrvalList(read);

/** The request parameters of the latest read, without its page window. */
function lastRequest(): Record<string, unknown> {
  const { page: _page, size: _size, ...rest } = read.mock.calls.at(-1)?.[0] ?? {};
  return rest;
}

/** A list page wired the way a screen wires it: the address's filters in, the reader's changes out. */
function Page({ router, forced }: { router: MemoryRouter; forced?: Record<string, unknown> }) {
  const search = useRouteSearch(router);
  const nav = useCrudNavigation(search, (next, options) => router.navigate(next, options));
  const useList = useMemo(() => (forced ? adaptForcedList(read, forced) : useJobs), [forced]);
  const list = useCrudList<unknown>(useList, {
    stateMode: "server",
    filterMode: "immediate",
    scopeKey: forced ? forcedScope(forced) : undefined,
    addressedFilters: { value: nav.filters, onChange: nav.setFilters, controls: CONTROLS, forced },
  });
  return (
    <div>
      <FilterBar filters={CONTROLS} state={list.filters} />
      <output data-testid="view">{nav.view}</output>
      <output data-testid="page">{list.pagination.page}</output>
      <button type="button" onClick={() => list.filters.commitValue("status.in", ["PAUSED"])}>pause</button>
      <button type="button" onClick={() => list.filters.commitValues({ "status.in": ["FAILED"], "active.equals": true })}>both</button>
      <button type="button" onClick={() => list.pagination.setPage(3)}>page3</button>
      <button type="button" onClick={() => nav.showDetail("7")}>open</button>
      <button type="button" onClick={nav.showList}>close</button>
    </div>
  );
}

const badges = () => [...document.querySelectorAll("[data-filter-chip]")].map((chip) => chip.textContent);
const search = (router: MemoryRouter) => validateCrudSearch(flatSearch.parseSearch(router.address));

beforeEach(() => read.mockClear());

describe("a list opened with filters in its address", () => {
  it("applies them: the badge is drawn and the very first request carries them", () => {
    const router = createMemoryRouter("?filters[status.in]=FAILED");
    render(<Page router={router} />);

    expect(badges()).toEqual(["Status:Failed"]);
    // The first read already carries the filter: no unfiltered request goes out first.
    expect(read.mock.calls[0]?.[0]).toMatchObject({ "status.in": ["FAILED"] });
    expect(read.mock.calls.every(([params]) => JSON.stringify(params["status.in"]) === '["FAILED"]')).toBe(true);
  });

  it("reads a toggle's text as the boolean its switch holds, so the badge is drawn for it too", () => {
    const router = createMemoryRouter("?filters[active.equals]=true&filters[status.in]=FAILED&filters[status.in]=PAUSED");
    render(<Page router={router} />);

    expect(badges()).toEqual(["Status:Failed, Paused", "Active:common.yes"]);
    expect(lastRequest()).toEqual({ "status.in": ["FAILED", "PAUSED"], "active.equals": true });
  });

  it("does not write the address on opening", () => {
    const router = createMemoryRouter("?filters[status.in]=FAILED");
    render(<Page router={router} />);
    expect(router.length).toBe(1);
    expect(router.address).toBe("?filters[status.in]=FAILED");
  });

  it("is unfiltered when the address names no filters", () => {
    const router = createMemoryRouter("");
    render(<Page router={router} />);
    expect(badges()).toEqual([]);
    expect(lastRequest()).toEqual({});
  });

  it("does not apply a filter over the field a tab forces, and sends the tab's value", () => {
    const router = createMemoryRouter("?filters[status.in]=FAILED&filters[active.equals]=true");
    render(<Page router={router} forced={{ "status.equals": "SUSPENDED" }} />);
    expect(lastRequest()).toEqual({ "status.equals": "SUSPENDED", "active.equals": true });
  });
});

describe("a filter the reader changes", () => {
  it("is written into the address with replace, so the history keeps its length", () => {
    const router = createMemoryRouter("?filters[status.in]=FAILED");
    render(<Page router={router} />);

    fireEvent.click(screen.getByText("pause"));
    expect(search(router).filters).toEqual({ "status.in": "PAUSED" });
    expect(router.length).toBe(1);

    fireEvent.click(screen.getByText("both"));
    expect(search(router).filters).toEqual({ "status.in": "FAILED", "active.equals": "true" });
    expect(router.length).toBe(1);
    expect(badges()).toEqual(["Status:Failed", "Active:common.yes"]);
  });

  it("writes the first filter of an unfiltered list, and drops the key when the last one is removed", () => {
    const router = createMemoryRouter("");
    render(<Page router={router} />);

    fireEvent.click(screen.getByText("pause"));
    expect(router.address).toBe("?filters%5Bstatus.in%5D=PAUSED");

    fireEvent.click(screen.getByLabelText("filter.removeFilter"));
    expect(router.address).toBe("");
    expect(router.length).toBe(1);
    expect(badges()).toEqual([]);
  });

  it("keeps the record that is open while the filters change", () => {
    const router = createMemoryRouter("?id=7&filters[status.in]=FAILED");
    render(<Page router={router} />);
    expect(screen.getByTestId("view").textContent).toBe("detail");

    fireEvent.click(screen.getByText("pause"));
    expect(search(router)).toMatchObject({ id: "7", filters: { "status.in": "PAUSED" } });
    expect(screen.getByTestId("view").textContent).toBe("detail");
  });

  it("sends the request for the changed filters, once the address has shown them", () => {
    const router = createMemoryRouter("?filters[status.in]=FAILED");
    render(<Page router={router} />);
    fireEvent.click(screen.getByText("pause"));
    expect(lastRequest()).toEqual({ "status.in": ["PAUSED"] });
  });
});

describe("a record opened and closed", () => {
  it("returns to the same filtered list", () => {
    const router = createMemoryRouter("?filters[status.in]=FAILED&filters[status.in]=PAUSED");
    render(<Page router={router} />);

    fireEvent.click(screen.getByText("open"));
    expect(search(router)).toMatchObject({ id: "7", filters: { "status.in": ["FAILED", "PAUSED"] } });
    expect(router.length).toBe(2);
    expect(badges()).toEqual(["Status:Failed, Paused"]);

    fireEvent.click(screen.getByText("close"));
    expect(search(router)).toEqual({ id: undefined, mode: undefined, tab: undefined, filters: { "status.in": ["FAILED", "PAUSED"] } });
    expect(screen.getByTestId("view").textContent).toBe("list");
    expect(badges()).toEqual(["Status:Failed, Paused"]);
    expect(lastRequest()).toEqual({ "status.in": ["FAILED", "PAUSED"] });
  });
});

describe("an address that changes under the list", () => {
  it("is adopted, back on the first page", () => {
    const router = createMemoryRouter("?filters[status.in]=FAILED");
    render(<Page router={router} />);
    fireEvent.click(screen.getByText("page3"));
    expect(screen.getByTestId("page").textContent).toBe("3");

    act(() => router.navigate({ filters: { "status.in": ["PAUSED"] } }));

    expect(badges()).toEqual(["Status:Paused"]);
    expect(screen.getByTestId("page").textContent).toBe("1");
    expect(lastRequest()).toEqual({ "status.in": ["PAUSED"] });
  });

  it("clears the filters when it moves to an address that names none", () => {
    const router = createMemoryRouter("?filters[status.in]=FAILED");
    render(<Page router={router} />);

    act(() => router.navigate({}));

    expect(badges()).toEqual([]);
    expect(lastRequest()).toEqual({});
    // The list did not write anything back over the address the reader moved to.
    expect(router.address).toBe("");
  });

  it("follows Back to the filters it came from, without writing them again", () => {
    const router = createMemoryRouter("?filters[status.in]=FAILED");
    render(<Page router={router} />);
    fireEvent.click(screen.getByText("open"));
    act(() => router.navigate({ id: "7", filters: { "status.in": ["PAUSED"] } }));
    expect(badges()).toEqual(["Status:Paused"]);
    const length = router.length;

    act(() => router.back());

    expect(search(router)).toMatchObject({ id: "7", filters: { "status.in": "FAILED" } });
    expect(badges()).toEqual(["Status:Failed"]);
    expect(router.length).toBe(length);
  });

  // A second change made before the address showed the first one must survive the first one
  // arriving: otherwise the first echo is read as somebody else's change and undoes the second.
  it("does not undo a change made while an earlier one was still on its way to the address", () => {
    const router = createMemoryRouter("");
    const held: Array<() => void> = [];
    const navigate = router.navigate.bind(router);
    router.navigate = (next, options) => {
      held.push(() => navigate(next, options));
    };
    render(<Page router={router} />);

    fireEvent.click(screen.getByText("pause"));
    fireEvent.click(screen.getByText("both"));
    expect(held).toHaveLength(2);

    act(() => held[0]?.());
    expect(badges()).toEqual(["Status:Failed", "Active:common.yes"]);
    act(() => held[1]?.());
    expect(badges()).toEqual(["Status:Failed", "Active:common.yes"]);
    expect(search(router).filters).toEqual({ "status.in": "FAILED", "active.equals": "true" });
    expect(lastRequest()).toEqual({ "status.in": ["FAILED"], "active.equals": true });
  });
});

describe("under StrictMode, which renders and runs effects twice", () => {
  it("writes each change once and settles", () => {
    const router = createMemoryRouter("?filters[status.in]=FAILED");
    const navigate = vi.spyOn(router, "navigate");
    render(
      <StrictMode>
        <Page router={router} />
      </StrictMode>,
    );
    expect(navigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("pause"));
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith({ id: undefined, mode: undefined, tab: undefined, filters: { "status.in": ["PAUSED"] } }, { replace: true });
    expect(badges()).toEqual(["Status:Paused"]);
    expect(router.length).toBe(1);
  });
});

describe("a list that does not use the address", () => {
  it("keeps its filters to itself, exactly as before", () => {
    const writes = vi.fn();
    function Plain() {
      const list = useCrudList<unknown>(useJobs, { stateMode: "server", filterMode: "immediate", defaultFilters: { "status.in": ["FAILED"] } });
      writes(list.filters.committedValues);
      return (
        <div>
          <FilterBar filters={CONTROLS} state={list.filters} />
          <button type="button" onClick={() => list.filters.commitValue("status.in", ["PAUSED"])}>pause</button>
        </div>
      );
    }
    render(<Plain />);
    expect(badges()).toEqual(["Status:Failed"]);
    expect(lastRequest()).toEqual({ "status.in": ["FAILED"] });
    fireEvent.click(screen.getByText("pause"));
    expect(badges()).toEqual(["Status:Paused"]);
    expect(lastRequest()).toEqual({ "status.in": ["PAUSED"] });
  });

  it("starts on its defaults where the address names no filters, and writes nothing until a filter changes", () => {
    const router = createMemoryRouter("");
    function Defaulted() {
      const search = useRouteSearch(router);
      const nav = useCrudNavigation(search, (next, options) => router.navigate(next, options));
      const list = useCrudList<unknown>(useJobs, {
        stateMode: "server",
        filterMode: "immediate",
        defaultFilters: { "status.in": ["FAILED"] },
        addressedFilters: { value: nav.filters, onChange: nav.setFilters, controls: CONTROLS },
      });
      return <FilterBar filters={CONTROLS} state={list.filters} />;
    }
    render(<Defaulted />);
    expect(badges()).toEqual(["Status:Failed"]);
    expect(router.address).toBe("");
    expect(router.length).toBe(1);
  });
});

describe("the count and the list send one request for one set of filters", () => {
  // Both the tile's count and the list read the filters through the same function, so a link's
  // filters object cannot make the count and the list ask the server different questions.
  const SETS: Array<[string, Record<string, string | string[]>]> = [
    ["a set as an array", { "status.in": ["FAILED", "PAUSED"] }],
    ["a one-element set", { "status.in": ["FAILED"] }],
    ["a set as the one string a link reads back", { "status.in": "FAILED" }],
    ["a toggle", { "active.equals": "true" }],
    ["a range", { "at.greaterThanOrEqualTo": "2026-11-01T00:00:00Z", "at.lessThanOrEqualTo": "2026-11-02T00:00:00Z" }],
    ["text", { "name.contains": "kim" }],
    ["mixed", { "status.in": ["FAILED"], "active.equals": "false", "name.contains": "kim" }],
  ];

  for (const [name, filters] of SETS) {
    it(`for ${name}`, () => {
      const router = createMemoryRouter(flatSearch.stringifySearch({ filters }));
      render(<Page router={router} />);
      // The list's request, minus its page window, is what the helper yields for the same filters.
      expect(lastRequest()).toEqual(filtersToRequestParams(filters, { controls: CONTROLS }));
    });
  }

  it("with the forced parameters of a tab and the adapter's own transform", () => {
    const forced = { "status.equals": "SUSPENDED" };
    const filters = { "status.in": "FAILED", "active.equals": "true" };
    const router = createMemoryRouter(flatSearch.stringifySearch({ filters }));
    render(<Page router={router} forced={forced} />);
    expect(lastRequest()).toEqual(filtersToRequestParams(filters, { controls: CONTROLS, forced }));

    const transform = (values: Record<string, unknown>) => ({ ...values, "extra.equals": "x" });
    expect(filtersToRequestParams({ "name.contains": "kim" }, { transformFilters: transform })).toEqual({
      "name.contains": "kim",
      "extra.equals": "x",
    });
  });

  it("sends nothing for no filters, and never a blank condition", () => {
    expect(filtersToRequestParams(undefined)).toEqual({});
    expect(filtersToRequestParams({ "a.equals": "", "b.in": [] })).toEqual({});
  });
});
