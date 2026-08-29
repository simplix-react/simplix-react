import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { generateSchemaFiles } from "../meta/generation/schema-gen.js";
import { resolveMeta } from "../meta/resolve.js";
import type { DtoMeta } from "../meta/types.js";
import { smartSafetyDomains } from "../meta/__fixtures__/smart-safety-domains.js";

/**
 * The CRUD scaffolder locates an entity's schema with the patterns in `findSchemaFile`. When none
 * matches it falls back to a placeholder field set **with no warning**, so a scaffold reports
 * success and emits an id/name form. These tests hold the generator's output and that search
 * against each other; nothing else fails when they drift apart.
 */
const meta: DtoMeta = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url)),
    "utf-8",
  ),
);

const containerTypes = {
  SimpliXApiResponse: { unwrap: true },
  Page: { ts: "SpringPage", zod: "pageOf", import: "@simplix-react-ext/simplix-boot-auth" },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};

/** `findSchemaFile`'s first pattern, kept in step with `scaffold-crud.ts`. */
function findsEntity(entityName: string, content: string): boolean {
  return new RegExp(
    `\\w*${entityName}\\w*[Ss]chema\\s*=\\s*(?:(?:z|zod)\\.object|\\w+[Ss]chema\\.extend)`,
    "i",
  ).test(content);
}

function entityNameOf(tag: string): string {
  const last = tag.split(".").pop() ?? tag;
  return last.charAt(0).toLowerCase() + last.slice(1);
}

/**
 * Entities whose DTO family carries a name of its own, so no pattern built from the entity's name
 * reaches it: `space.Drawing` is served by `FloorPlan*`, `system.MailCheck` by `EmailTest*`,
 * `user.admin.UserAvatar` by `File*`. The orval path finds these because it names constants after
 * operation ids, which do carry the entity name; naming a constant after its DTO does not.
 *
 * Closing this needs the entity's primary DTO, which is the response of its detail read — role
 * detection, and therefore Task 9's job. The list is pinned rather than described so that closing
 * it, or a capture that widens it, fails here instead of surfacing as a placeholder form.
 */
const NAMED_APART_FROM_THEIR_ENTITY = [
  "data-io.DuplicateMerge",
  "notification.DutyRoster",
  "party.roster.WorkerCensus",
  "public.system.InstallationSetup",
  "public.user.Avatar",
  "regulation.LawPackInstallation",
  "regulation.LawScreenMap",
  "regulation.ObligationAssessment",
  "regulation.PolicyValueResolution",
  "space.Drawing",
  "system.ExportDownload",
  "system.MailCheck",
  "user.admin.UserAvatar",
];

describe("the scaffolder can find what the schema generator writes", () => {
  it("finds every configured entity whose DTOs carry its name", () => {
    const resolved = resolveMeta(meta, { domains: smartSafetyDomains, containerTypes });

    const unfindable: string[] = [];
    for (const domain of resolved.domains.values()) {
      if (domain.entities.length === 0) continue;
      const emitted = [...generateSchemaFiles(domain).files.values()].join("\n");
      for (const entity of domain.entities) {
        if (!findsEntity(entityNameOf(entity.tag), emitted)) unfindable.push(entity.tag);
      }
    }

    expect(unfindable.sort()).toEqual(NAMED_APART_FROM_THEIR_ENTITY);
  });

  it("finds an entity whose every DTO extends another, which no z.object pattern reaches", () => {
    const resolved = resolveMeta(meta, { domains: { site: ["site.AreaZone"] }, containerTypes });
    const emitted = [...generateSchemaFiles(resolved.domains.get("site")!).files.values()].join("\n");

    // Every AreaZone declaration is an extend; the chain's z.object roots are named for Area.
    expect(emitted).toMatch(/AreaZoneCreateDTOSchema\s*=\s*\w+Schema\.extend/);
    expect(emitted).not.toMatch(/AreaZone\w*Schema\s*=\s*z\.object/);
    expect(findsEntity("areaZone", emitted)).toBe(true);
  });
});
