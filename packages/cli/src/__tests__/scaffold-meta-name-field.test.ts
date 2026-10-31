import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

import { loadMetaHolders, loadMetaScaffoldSource } from "../meta/scaffold-source.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { registerSpecProfile } from "../openapi/plugin-registry.js";

/** Which entities the snapshot the mocked config points at declares a name field for. */
vi.mock("../config/config-loader.js", async () => {
  const { readFileSync, writeFileSync, mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { fileURLToPath: toPath } = await import("node:url");
  const { smartSafetyDomains: domains } = await import("../meta/__fixtures__/smart-safety-domains.js");
  const fixture = JSON.parse(
    readFileSync(toPath(new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url)), "utf-8"),
  );
  const snapshot = join(mkdtempSync(join(tmpdir(), "name-field-")), "meta.json");
  writeFileSync(
    snapshot,
    JSON.stringify({
      ...fixture,
      entities: {
        Holiday: { nameField: "siteId" },
        HolidayCalendar: {
          holders: [{ entity: "Holiday", field: "holidayCalendarId", operators: ["EQUALS"] }],
        },
      },
    }),
  );
  return {
    loadConfig: vi.fn(async () => ({
      openapi: [{ profile: "name-field-test", domains, meta: { snapshot } }],
    })),
  };
});

const containerTypes: Record<string, ContainerMapping> = {
  SimpliXApiResponse: { unwrap: true },
  Page: { ts: "SpringPage", zod: "pageOf", import: "@simplix-react-ext/simplix-boot-auth" },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};

const namingModule = fileURLToPath(
  new URL("../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts", import.meta.url),
);
const { simplixBootNaming } = (await import(namingModule)) as { simplixBootNaming: OpenApiNamingStrategy };
registerSpecProfile("name-field-test", { naming: simplixBootNaming, responseAdapter: "raw", containerTypes });

describe("a record's name as the committed SimpliX Meta declares it", () => {
  it("names the scaffolded entity by its declared field, not by the field-name guess", async () => {
    // The guess for Holiday is `holidayName`; the snapshot declares `siteId`.
    const source = await loadMetaScaffoldSource("/unused", "holiday");
    expect(source?.displayNameField).toBe("siteId");
  });

  it("names a holder's sub-list rows the same way", async () => {
    const holders = await loadMetaHolders("/unused", "holidayCalendar");
    expect(holders.map((one) => one.entity)).toEqual(["holiday"]);
    expect(holders[0]?.source.displayNameField).toBe("siteId");
  });

  it("keeps the guess for an entity the snapshot declares nothing for", async () => {
    const source = await loadMetaScaffoldSource("/unused", "areaZone");
    expect(source?.displayNameField).toBe("areaName");
  });
});
