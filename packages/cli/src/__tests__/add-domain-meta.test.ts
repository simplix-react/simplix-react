import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// Injected at build time; the scaffolder reads it for the framework versions it pins.
(globalThis as Record<string, unknown>).__FW_VERSIONS__ = {
  "simplix-react": "0.0.0-test",
  "@simplix-react/cli": "0.0.0-test",
};
(globalThis as Record<string, unknown>).__DEP_VERSIONS__ = {};

const { addDomainCommand } = await import("../commands/add-domain.js");

/**
 * A project that generates from SimpliX Meta has dropped Orval, so a domain scaffolded into it
 * must not reintroduce the dependency or a codegen script that reads a document the configuration
 * no longer states.
 */
async function project(configBody: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "add-domain-meta-"));
  await writeFile(
    join(dir, "package.json"),
    JSON.stringify({ name: "acme", private: true, version: "0.0.0" }, null, 2),
    "utf-8",
  );
  await writeFile(join(dir, "simplix.config.ts"), configBody, "utf-8");
  await mkdir(join(dir, "packages"), { recursive: true });
  return dir;
}

// A plain object rather than `defineConfig`, which the loader would resolve through an alias this
// fixture has no package for.
const META_CONFIG = `export default {
  openapi: [
    {
      domains: { pet: ["shop.Pet"] },
      meta: { source: "http://localhost:8082/api/v1/dev/meta/dto" },
    },
  ],
};
`;

async function run(dir: string, name: string): Promise<void> {
  const cwd = process.cwd();
  process.chdir(dir);
  try {
    await addDomainCommand.parseAsync(["node", "simplix", name, "-y"]);
  } finally {
    process.chdir(cwd);
  }
}

describe("add-domain in a SimpliX Meta project", () => {
  it("names neither orval nor the openapi command", async () => {
    const dir = await project(META_CONFIG);
    await run(dir, "pet");

    const pkg = JSON.parse(
      await readFile(join(dir, "packages/acme-domain-pet/package.json"), "utf-8"),
    ) as { devDependencies?: Record<string, string>; scripts?: Record<string, string> };

    expect(pkg.devDependencies?.orval).toBeUndefined();
    expect(pkg.scripts?.codegen).toBe("simplix meta -d pet");
    await rm(dir, { recursive: true, force: true });
  });

  it("points the barrel at the meta output, so the package resolves before the first run", async () => {
    const dir = await project(META_CONFIG);
    await run(dir, "pet");

    const index = await readFile(join(dir, "packages/acme-domain-pet/src/index.ts"), "utf-8");
    expect(index).toContain("./generated-meta");
    expect(index).not.toContain("./generated/model");
    await rm(dir, { recursive: true, force: true });
  });

  it("still writes the mutator the generated request functions call", async () => {
    const dir = await project(META_CONFIG);
    await run(dir, "pet");

    const mutator = await readFile(join(dir, "packages/acme-domain-pet/src/mutator.ts"), "utf-8");
    expect(mutator).toContain("customFetch");
    await rm(dir, { recursive: true, force: true });
  });
});
