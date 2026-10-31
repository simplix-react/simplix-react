import { describe, expect, it } from "vitest";
import { listSearchParams } from "../../crud/list/list-search-params";

type ListLike = Parameters<typeof listSearchParams>[0];

function listOf(values: Record<string, unknown>, search: string, sort: string | null): ListLike {
  return {
    filters: { committedValues: values, search } as ListLike["filters"],
    sort: { field: sort, direction: "desc" } as ListLike["sort"],
  };
}

describe("listSearchParams", () => {
  it("sends the committed filters, the free text and the sort, and no page", () => {
    const params = listSearchParams(listOf({ "actorType.equals": "ADMIN", "action.in": [] }, " alice ", "occurredAt"), {
      searchKey: "keyword",
    });
    expect(params).toEqual({ "actorType.equals": "ADMIN", keyword: "alice", sort: ["occurredAt.desc"] });
  });

  it("lets the forced parameters win and applies the adapter's transform", () => {
    const params = listSearchParams(listOf({ "status.equals": "OPEN" }, "", null), {
      transformFilters: (filters) => ({ ...filters, "extra.equals": "x" }),
      forced: { "status.equals": "CLOSED" },
    });
    expect(params).toEqual({ "status.equals": "CLOSED", "extra.equals": "x" });
  });
});
