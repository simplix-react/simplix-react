import { describe, expect, it } from "vitest";

import { figureTilesOf } from "../meta/figure-tiles.js";

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
