import { describe, expect, it } from "vitest";

import { chooseDefaultSort } from "../meta/default-sort.js";

const fields = [
  { name: "jobId", sortable: true },
  { name: "createdAt", sortable: true },
  { name: "occurredAt", sortable: true },
  { name: "note", sortable: false },
];

describe("chooseDefaultSort", () => {
  it("takes the order the entity declares", () => {
    expect(chooseDefaultSort({ declared: { field: "occurredAt" }, fields, rowIdField: "jobId" })).toEqual({ field: "occurredAt", direction: "desc" });
  });
  it("keeps a declared direction", () => {
    expect(chooseDefaultSort({ declared: { field: "occurredAt", direction: "asc" }, fields, rowIdField: "jobId" })).toEqual({ field: "occurredAt", direction: "asc" });
  });
  it("passes over a declared field the backend cannot order by", () => {
    expect(chooseDefaultSort({ declared: { field: "note" }, candidates: ["createdAt"], fields, rowIdField: "jobId" })).toEqual({ field: "createdAt", direction: "desc" });
  });
  it("takes the first candidate the row carries and the backend orders by", () => {
    expect(chooseDefaultSort({ candidates: ["receivedAt", "occurredAt", "createdAt"], fields, rowIdField: "jobId" })).toEqual({ field: "occurredAt", direction: "desc" });
  });
  it("reads a candidate with its own direction", () => {
    expect(chooseDefaultSort({ candidates: [{ field: "createdAt", direction: "asc" }], fields, rowIdField: "jobId" })).toEqual({ field: "createdAt", direction: "asc" });
  });
  it("never orders by the row's key", () => {
    expect(chooseDefaultSort({ declared: { field: "jobId" }, candidates: ["jobId"], fields, rowIdField: "jobId" })).toBeUndefined();
  });
  it("leaves the server's order where nothing fits", () => {
    expect(chooseDefaultSort({ candidates: ["day"], fields, rowIdField: "jobId" })).toBeUndefined();
  });
  it("does not take a candidate whose sortability is unknown", () => {
    expect(chooseDefaultSort({ candidates: ["createdAt"], fields: [{ name: "createdAt" }], rowIdField: "jobId" })).toBeUndefined();
  });
});
