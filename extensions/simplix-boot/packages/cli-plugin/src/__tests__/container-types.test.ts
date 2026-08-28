import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { bootContainerTypes } from "../container-types.js";

// The fixture lives in the CLI package; resolve it from this file rather than from a cwd.
const fixturePath = fileURLToPath(
  new URL(
    "../../../../../../packages/cli/src/meta/__fixtures__/smart-safety-meta.json",
    import.meta.url,
  ),
);

/**
 * Structural subset of the IR's `TypeRef` this walk needs: the discriminator, the container's
 * name, and the generic arguments both `container` and `ref` can carry.
 */
interface TypeRefNode {
  kind: string;
  name?: string;
  args?: TypeRefNode[];
}

interface MetaFixture {
  types: Record<string, { fields: { type: TypeRefNode }[] }>;
  operations: {
    response?: TypeRefNode;
    request: {
      body?: TypeRefNode;
      query: { type: TypeRefNode }[];
      path: { type: TypeRefNode }[];
    };
  }[];
}

function loadFixture(): MetaFixture {
  return JSON.parse(readFileSync(fixturePath, "utf-8"));
}

const meta = loadFixture();

/** Tally of container name → how many times it occurs, across every TypeRef in the fixture. */
function countContainers(): Map<string, number> {
  const tally = new Map<string, number>();

  function walk(type: TypeRefNode | undefined): void {
    if (!type) return;
    if (type.kind === "container" && type.name !== undefined) {
      tally.set(type.name, (tally.get(type.name) ?? 0) + 1);
    }
    // Both `container` and a generic `ref` carry `args`, and a container nests inside either.
    for (const arg of type.args ?? []) walk(arg);
  }

  for (const type of Object.values(meta.types)) {
    for (const field of type.fields) walk(field.type);
  }
  for (const operation of meta.operations) {
    walk(operation.response);
    walk(operation.request.body);
    for (const param of operation.request.query) walk(param.type);
    for (const param of operation.request.path) walk(param.type);
  }

  return tally;
}

describe("bootContainerTypes", () => {
  const used = countContainers();

  it("covers every container the captured IR actually uses", () => {
    const missing = [...used.keys()].filter((name) => !(name in bootContainerTypes));
    expect(missing).toEqual([]);
  });

  it("finds the four containers the capture carries, and no others", () => {
    expect(Object.fromEntries(used)).toEqual({
      SimpliXApiResponse: 648,
      List: 405,
      Page: 93,
      Map: 74,
    });
  });

  it("drops the envelope instead of giving it a client type", () => {
    expect(bootContainerTypes.SimpliXApiResponse).toEqual({ unwrap: true });
  });

  it("maps Page onto the boot-auth page type and schema factory", () => {
    expect(bootContainerTypes.Page).toEqual({
      ts: "SpringPage",
      zod: "pageOf",
      import: "@simplix-react-ext/simplix-boot-auth",
    });
  });

  it("maps List onto an array", () => {
    expect(bootContainerTypes.List).toEqual({ ts: "Array", zod: "z.array" });
  });

  it("restores the map key the IR drops", () => {
    expect(bootContainerTypes.Map).toEqual({
      ts: "Record",
      zod: "z.record",
      keyType: "string",
    });
  });
});
