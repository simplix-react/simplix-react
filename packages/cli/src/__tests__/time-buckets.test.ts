import { describe, expect, it } from "vitest";

import type { EndpointTarget } from "../meta/generation/endpoint-gen.js";
import { timeBucketsOf } from "../meta/scaffold-source.js";

const target = (method: string, path: string, name: string, timeAxis?: string) =>
  ({ operation: { method, path, timeAxis }, name, role: name }) as unknown as EndpointTarget;

describe("timeBucketsOf", () => {
  const search = target("GET", "/admin/jobs/background-job/search", "searchBackgroundJobs", "runAt");
  const counts = target("GET", "/admin/jobs/background-job/counts", "getBackgroundJobCounts");

  it("pairs the search operation's time axis with the counts read beside it", () => {
    expect(timeBucketsOf([search, counts], search)).toEqual({ field: "runAt", fetch: "getBackgroundJobCounts" });
  });

  it("states nothing without a declared axis or without the counts read", () => {
    expect(timeBucketsOf([target("GET", "/x/search", "searchX"), counts], undefined)).toBeUndefined();
    expect(timeBucketsOf([search], search)).toBeUndefined();
  });
});
