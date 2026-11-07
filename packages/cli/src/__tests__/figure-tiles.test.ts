import { describe, expect, it } from "vitest";

import { figureTilesOf, withTileFilters } from "../meta/figure-tiles.js";

const fields = [
  { name: "status", contractKind: "enum", enumTypeName: "JobStatus", options: ["QUEUED", "FAILED"] },
  { name: "costMicros", contractKind: "money", money: { currency: "USD", scale: 6 } },
  { name: "creditsCharged", contractKind: "number" },
  { name: "exceptionType", contractKind: "text" },
];
const hooks = { statusCounts: "useGetJobStatusCounts", aggregates: "useGetJobAggregates" };

describe("figureTilesOf", () => {
  it("draws a tile per value of the first counted enum", () => {
    expect(figureTilesOf({ statusCounts: ["status"], hooks, fields, rowIdField: "jobId" })?.status).toEqual({ hook: "useGetJobStatusCounts", field: "status", enumName: "JobStatus", options: ["QUEUED", "FAILED"] });
  });
  it("draws a tile per sum and per row count, keeping the money a sum is in", () => {
    const tiles = figureTilesOf({ aggregates: [{ field: "jobId", op: "count" }, { field: "costMicros", op: "sum" }, { field: "creditsCharged", op: "sum" }], hooks, fields, rowIdField: "jobId" });
    expect(tiles?.aggregates?.figures).toEqual([
      { field: "jobId", op: "count", kind: "number", isRowCount: true },
      { field: "costMicros", op: "sum", kind: "money", money: { currency: "USD", scale: 6 }, isRowCount: false },
      { field: "creditsCharged", op: "sum", kind: "number", isRowCount: false },
    ]);
  });
  it("leaves a distinct count, an extreme and a sum of text to the screen", () => {
    expect(figureTilesOf({ aggregates: [{ field: "exceptionType", op: "countDistinct" }, { field: "costMicros", op: "max" }, { field: "exceptionType", op: "sum" }], hooks, fields, rowIdField: "jobId" })).toBeUndefined();
  });
  it("draws nothing where Meta names nothing, where no hook was generated, or where the field is not a known enum", () => {
    expect(figureTilesOf({ hooks, fields, rowIdField: "jobId" })).toBeUndefined();
    expect(figureTilesOf({ statusCounts: ["status"], hooks: {}, fields, rowIdField: "jobId" })).toBeUndefined();
    expect(figureTilesOf({ statusCounts: ["exceptionType"], hooks, fields, rowIdField: "jobId" })).toBeUndefined();
  });
});

describe("the list filters beside the figure tiles", () => {
  const status = { hook: "useCounts", field: "standing", enumName: "Standing", options: ["ACTIVE", "SUSPENDED"] };

  it("add a choice on the field a status tile narrows, so the filter bar shows a pressed tile", () => {
    expect(withTileFilters([{ kind: "dateRange" as const, field: "lastSeenAt" }], { status })).toEqual([
      { kind: "dateRange", field: "lastSeenAt" },
      { kind: "choice", field: "standing", enumTypeName: "Standing", options: ["ACTIVE", "SUSPENDED"] },
    ]);
  });

  it("leave a field the contract already filters by as it is", () => {
    const filters = [{ kind: "choice" as const, field: "standing", enumTypeName: "Standing", options: ["ACTIVE"] }];
    expect(withTileFilters(filters, { status })).toEqual(filters);
  });

  it("add nothing without a status tile", () => {
    expect(withTileFilters([], undefined)).toEqual([]);
  });
});

describe("figureTilesOf with what Meta declares about tones and signs", () => {
  const toned = [
    { name: "status", contractKind: "enum", enumTypeName: "JobStatus", options: ["QUEUED", "FAILED"], tones: { FAILED: "danger" } },
    { name: "amount", contractKind: "credits", signed: true },
    { name: "held", contractKind: "credits" },
  ];

  it("draws each status tile in the tone its value declares", () => {
    expect(figureTilesOf({ statusCounts: ["status"], hooks, fields: toned, rowIdField: "jobId" })?.status?.tones).toEqual({ FAILED: "danger" });
  });

  it("keeps a ledger sum signed and an unsigned sum plain", () => {
    const tiles = figureTilesOf({ aggregates: [{ field: "amount", op: "sum" }, { field: "held", op: "sum" }], hooks, fields: toned, rowIdField: "jobId" });
    expect(tiles?.aggregates?.figures).toEqual([
      { field: "amount", op: "sum", kind: "credits", signed: true, isRowCount: false },
      { field: "held", op: "sum", kind: "credits", isRowCount: false },
    ]);
  });
});
