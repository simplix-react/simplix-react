import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { metaEntities } from "../meta/write.js";
import { resolveMeta } from "../meta/resolve.js";
import { smartSafetyDomains } from "../meta/__fixtures__/smart-safety-domains.js";
import type { DtoMeta } from "../meta/types.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";

/**
 * The locale overlay and the i18n download read an entity's name and its field list, and the
 * snapshot stores whatever it is handed. Building that shape from SimpliX Meta is what lets a
 * project drop Orval: without it those three artifacts have no source once the OpenAPI half stops.
 */
const meta: DtoMeta = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url)),
    "utf-8",
  ),
);

const containerTypes: Record<string, ContainerMapping> = {
  SimpliXApiResponse: { unwrap: true },
  Page: { ts: "SpringPage", zod: "pageOf", import: "@simplix-react-ext/simplix-boot-auth" },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};

const resolved = resolveMeta(meta, { domains: smartSafetyDomains, containerTypes });

describe("metaEntities", () => {
  it("names one entity per tag, the way the strategy does", () => {
    const org = metaEntities(resolved.domains.get("org")!);
    expect(org.map((one) => one.name).sort()).toEqual(["orgType", "organization"]);
    expect(org.find((one) => one.name === "organization")?.pascalName).toBe("Organization");
    expect(org.find((one) => one.name === "organization")?.tags).toEqual(["org.Organization"]);
  });

  it("carries the fields a locale file is written from", () => {
    const organization = metaEntities(resolved.domains.get("org")!).find(
      (one) => one.name === "organization",
    );
    const names = organization?.fields.map((one) => one.name) ?? [];
    expect(names).toContain("orgName");
    expect(names).toContain("orgCode");
    // Inherited fields count: a locale file names what a screen shows, wherever it was declared.
    expect(names).toContain("createdAt");
  });

  it("carries an enum's values, which is what the locale file's enum half is built from", () => {
    const site = metaEntities(resolved.domains.get("site")!);
    const withEnum = site.flatMap((one) => one.fields).find((one) => one.enum !== undefined);
    expect(withEnum?.enum?.length).toBeGreaterThan(0);
    expect(withEnum?.enumTypeName).toBeTruthy();
  });

  it("gives every configured domain a non-empty list, so no domain loses its locales", () => {
    const empty = [...resolved.domains.entries()]
      .filter(([, domain]) => domain.entities.length > 0)
      .filter(([, domain]) => metaEntities(domain).length === 0)
      .map(([name]) => name);
    expect(empty).toEqual([]);
  });
  it("leaves out the fields of another entity a DTO holds as a reference", () => {
    // A detail DTO naming its referenced record by the entity class itself reaches that class and
    // its ancestors; the parent's screens read only the reference's own label.
    const withReference: DtoMeta = structuredClone(meta);
    const detail = withReference.types.OrganizationDetailDTO!;
    const text = detail.fields.find((one) => one.type.kind === "string")!.type;
    withReference.types.Region = {
      javaClass: "example.region.Region",
      typeParams: [],
      fields: [{ ...detail.fields[0]!, name: "regionCode", type: text }],
    } as DtoMeta["types"][string];
    detail.fields.push({ ...detail.fields[0]!, name: "region", type: { kind: "ref", name: "Region" } });
    withReference.entities = { Region: { javaClass: "example.region.Region" } } as DtoMeta["entities"];
    const domain = resolveMeta(withReference, { domains: smartSafetyDomains, containerTypes }).domains.get("org")!;

    const fieldsOf = (document?: DtoMeta) =>
      metaEntities(domain, document)
        .find((one) => one.name === "organization")
        ?.fields.map((one) => one.name) ?? [];
    expect(fieldsOf(withReference)).toContain("region");
    expect(fieldsOf(withReference)).not.toContain("regionCode");
    // Without the document every reached type lends its fields, which is the leak.
    expect(fieldsOf()).toContain("regionCode");
  });
});
