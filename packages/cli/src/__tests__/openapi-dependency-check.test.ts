import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { isDependencyInstalled } from "../commands/openapi.js";

describe("isDependencyInstalled", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "dep-check-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("returns false when the package is not installed anywhere", async () => {
    const pkgDir = join(tempDir, "packages", "domain-x");
    await mkdir(pkgDir, { recursive: true });

    expect(await isDependencyInstalled("@scope/missing", pkgDir)).toBe(false);
  });

  it("returns true when the package is in the local node_modules", async () => {
    const pkgDir = join(tempDir, "packages", "domain-x");
    const depDir = join(pkgDir, "node_modules", "@scope", "present");
    await mkdir(depDir, { recursive: true });
    await writeFile(join(depDir, "package.json"), '{"name":"@scope/present"}');

    expect(await isDependencyInstalled("@scope/present", pkgDir)).toBe(true);
  });

  it("returns true when the package is hoisted to an ancestor node_modules", async () => {
    // The real scenario: a granular package provided transitively by a
    // meta-package and hoisted to the workspace root, not declared locally.
    const pkgDir = join(tempDir, "packages", "domain-x");
    await mkdir(pkgDir, { recursive: true });
    const hoistedDir = join(tempDir, "node_modules", "@scope", "hoisted");
    await mkdir(hoistedDir, { recursive: true });
    await writeFile(join(hoistedDir, "package.json"), '{"name":"@scope/hoisted"}');

    expect(await isDependencyInstalled("@scope/hoisted", pkgDir)).toBe(true);
  });
});
