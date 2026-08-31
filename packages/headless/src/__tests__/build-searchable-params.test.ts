import { describe, expect, it } from "vitest";

import { buildSearchableParams } from "../build-searchable-params";

describe("buildSearchableParams", () => {
  it("sends a sort when the state names a field and a direction", () => {
    const params = buildSearchableParams({ sort: { field: "endpointName", direction: "asc" } });
    expect(params.sort).toEqual(["endpointName.asc"]);
  });

  // The defect this guards: a sort state that exists while its field is still undefined used to
  // pass a truthiness check on the object and serialise as the literal `undefined.undefined`. The
  // server's parser matches `field.asc` / `field.desc` and rejects everything else, so every list
  // holding such a state answered 400 the moment it loaded — and the object being present is
  // exactly what makes the emptiness invisible to a guard that only asks whether it is there.
  it("sends no sort when the state has no field", () => {
    const params = buildSearchableParams({
      sort: { field: undefined, direction: undefined } as never,
    });
    expect(params.sort).toBeUndefined();
  });

  it("sends no sort when the state names a field but no direction", () => {
    const params = buildSearchableParams({ sort: { field: "endpointName" } as never });
    expect(params.sort).toBeUndefined();
  });

  it("sends no sort when there is no sort state at all", () => {
    expect(buildSearchableParams({}).sort).toBeUndefined();
  });
});
