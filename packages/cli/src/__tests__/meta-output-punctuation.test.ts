import { readFileSync } from "node:fs";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import type { DtoMeta } from "../meta/types.js";
import { resolveMeta } from "../meta/resolve.js";
import { smartSafetyDomains } from "../meta/__fixtures__/smart-safety-domains.js";
import { writeMetaOutput } from "../meta/write.js";

const EM_DASH = "\u2014";

/**
 * The fixture with every em dash in the backend's own text replaced, so a dash left in the output
 * can only have come from a generator's template.
 */
const raw = readFileSync(
  fileURLToPath(new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url)),
  "utf-8",
);
const meta: DtoMeta = JSON.parse(raw.replaceAll(EM_DASH, "-"));

const containerTypes: Record<string, ContainerMapping> = {
  SimpliXApiResponse: { unwrap: true },
  Page: { ts: "SpringPage", zod: "pageOf", import: "@simplix-react-ext/simplix-boot-auth" },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};

const namingModule = fileURLToPath(
  new URL("../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts", import.meta.url),
);
const { simplixBootNaming } = (await import(namingModule)) as {
  simplixBootNaming: OpenApiNamingStrategy;
};

const resolved = resolveMeta(meta, { domains: smartSafetyDomains, containerTypes });

const created: string[] = [];
afterAll(async () => {
  for (const dir of created) await rm(dir, { recursive: true, force: true });
});

async function filesUnder(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries.filter((e) => e.isFile()).map((e) => join(e.parentPath, e.name));
}

describe("generated meta output", () => {
  it("carries no em dash from any generator template", async () => {
    const offending: string[] = [];
    for (const [name, domain] of resolved.domains) {
      const dir = await mkdtemp(join(tmpdir(), `meta-punctuation-${name}-`));
      created.push(dir);
      await writeMetaOutput({ targetDir: dir, domain, naming: simplixBootNaming });
      for (const file of await filesUnder(dir)) {
        const lines = (await readFile(file, "utf-8")).split("\n");
        lines.forEach((line, i) => {
          if (line.includes(EM_DASH)) offending.push(`${name}:${file.slice(dir.length)}:${i + 1}: ${line.trim()}`);
        });
      }
    }
    expect(offending).toEqual([]);
  });
});
