import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { writeEntityLabels } from "../meta/entity-labels.js";
import type { ResolvedDomain } from "../meta/resolve.js";
import type { DtoMeta } from "../meta/types.js";

describe("an entity's name from SimpliX Meta", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "entity-labels-"));
    await mkdir(join(dir, "src/locales"), { recursive: true });
    await writeFile(join(dir, "src/locales/en.json"), JSON.stringify({ jobPosition: { fields: { positionName: "Position Name" } } }));
    await writeFile(join(dir, "src/locales/ko.json"), JSON.stringify({}));
  });
  afterEach(async () => rm(dir, { recursive: true, force: true }));

  const domain = { entities: [{ tag: "user.admin.JobPosition", patterns: [], operations: [] }] } as unknown as ResolvedDomain;
  const document = {
    version: 1, enums: {}, types: {}, operations: [],
    entities: { JobPosition: { label: { en: "Job Position" }, plural: { en: "Job Positions", ko: "Positions-ko" }, description: { en: "Ranks and titles." } } },
  } as DtoMeta;

  it("is written beside the field labels, and a locale with no name stays without one", async () => {
    await writeEntityLabels(dir, domain, document, ["en", "ko"]);
    const en = JSON.parse(await readFile(join(dir, "src/locales/en.json"), "utf-8"));
    const ko = JSON.parse(await readFile(join(dir, "src/locales/ko.json"), "utf-8"));
    expect(en.jobPosition).toEqual({ fields: { positionName: "Position Name" }, _label: "Job Position", _plural: "Job Positions", _description: "Ranks and titles." });
    expect(ko.jobPosition).toEqual({ _plural: "Positions-ko" });
  });
});
