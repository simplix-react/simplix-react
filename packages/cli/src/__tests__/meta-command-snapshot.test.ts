import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import { smartSafetyDomains } from "../meta/__fixtures__/smart-safety-domains.js";

vi.mock("../utils/logger.js", () => ({
  log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), success: vi.fn(), step: vi.fn() },
}));

const fixturePath = fileURLToPath(
  new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url),
);

const namingModule = fileURLToPath(
  new URL("../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts", import.meta.url),
);
const { simplixBootNaming } = (await import(namingModule)) as {
  simplixBootNaming: OpenApiNamingStrategy;
};

const config = {
  i18n: { locales: ["en", "ko"] },
  openapi: [
    {
      domains: smartSafetyDomains,
      naming: simplixBootNaming,
      meta: { source: fixturePath, snapshot: "openapi/meta.json" },
    },
  ],
};

vi.mock("../config/config-loader.js", () => ({
  loadConfig: vi.fn(async () => config),
}));

const { metaCommand } = await import("../commands/meta.js");

let projectDir: string;
let originalCwd: string;

beforeEach(async () => {
  originalCwd = process.cwd();
  projectDir = await mkdtemp(join(tmpdir(), "meta-command-snapshot-"));
  await writeFile(join(projectDir, "simplix.config.ts"), "export default {};\n");
  process.chdir(projectDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  await rm(projectDir, { recursive: true, force: true });
});

/** Commander keeps the last parse's option values, so each run states every flag it relies on. */
async function run(...args: string[]): Promise<void> {
  metaCommand.setOptionValue("offline", undefined);
  await metaCommand.parseAsync(["node", "simplix", ...args]);
}

describe("simplix meta and meta.snapshot", () => {
  it("writes the configured snapshot on a live run", async () => {
    await run();

    const written = JSON.parse(await readFile(join(projectDir, "openapi/meta.json"), "utf-8"));
    expect(written).toEqual(JSON.parse(readFileSync(fixturePath, "utf-8")));
  });

  it("leaves the snapshot untouched on an offline run, which reads it", async () => {
    await run();
    const snapshot = join(projectDir, "openapi/meta.json");
    const before = await readFile(snapshot, "utf-8");
    const writtenAt = (await stat(snapshot)).mtimeMs;

    await run("--offline");

    expect(await readFile(snapshot, "utf-8")).toBe(before);
    expect((await stat(snapshot)).mtimeMs).toBe(writtenAt);
  });
});
