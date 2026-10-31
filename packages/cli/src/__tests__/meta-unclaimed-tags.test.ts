import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { DtoMeta, OperationMeta } from "../meta/types.js";
import { closestDomain, ignoredTagMatcher, resolveMeta, unclaimedTagMessage } from "../meta/resolve.js";

vi.mock("../utils/logger.js", () => ({
  log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), success: vi.fn(), step: vi.fn() },
}));

const namingModule = fileURLToPath(
  new URL("../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts", import.meta.url),
);
const { simplixBootNaming } = (await import(namingModule)) as { simplixBootNaming: OpenApiNamingStrategy };

const claimedTag = "user.admin.UserAccount";
const config = {
  i18n: { locales: ["en", "ko"] },
  openapi: [{ domains: { user: [claimedTag] }, naming: simplixBootNaming, meta: { source: "", snapshot: "openapi/meta.json", ignoreTags: [] as string[] } }],
};

vi.mock("../config/config-loader.js", () => ({ loadConfig: vi.fn(async () => config) }));
const { metaCommand } = await import("../commands/meta.js");
const { log } = await import("../utils/logger.js");

function operation(id: string, tag: string): OperationMeta {
  return {
    id,
    method: "GET",
    path: `/${id}`,
    tag,
    access: { kind: "public" },
    response: { kind: "string" },
    request: { query: [], path: [] },
  };
}

/** One operation under each tag, so a tag is the whole of what a test names. */
function metaWithTags(tags: readonly string[]): DtoMeta {
  return { version: 1, enums: {}, types: {}, operations: tags.map((tag, at) => operation(`op${at}`, tag)) };
}

const domains: Record<string, string[]> = {
  user: ["user.admin.UserAccount", "user.admin.UserRole", "common.auth.AuthPermission"],
  auth: ["common.auth.RoleScopeGrant", "common.auth.SecurityPolicy", "common.auth.AuthSession"],
  system: ["system.SiteSettings", "/^public\\.system\\./"],
};

describe("the domain nearest a tag no domain claims", () => {
  it("is the one sharing the longest dot-separated prefix with the tag", () => {
    expect(closestDomain("user.admin.JobPosition", Object.entries(domains))).toEqual({
      domain: "user",
      prefix: "user.admin",
      patterns: 2,
    });
  });

  it("goes to the domain with more patterns under the shared prefix when two share it equally", () => {
    // `user` lists one pattern under `common.auth`, `auth` lists three.
    expect(closestDomain("common.auth.Brand", Object.entries(domains))).toEqual({
      domain: "auth",
      prefix: "common.auth",
      patterns: 3,
    });
  });

  it("goes to the domain configured first when the evidence is equal", () => {
    expect(closestDomain("x.y.Z", [["first", ["x.y.A"]], ["second", ["x.y.B"]]])?.domain).toBe("first");
  });

  it("is null where no pattern shares even the first segment, and ignores regular expressions", () => {
    expect(closestDomain("dev.test.Error", Object.entries(domains))).toBeNull();
    expect(closestDomain("ScalarController", Object.entries(domains))).toBeNull();
    // `public.system.Anything` would be claimed by the regex; as an unclaimed tag it has no literal prefix to compare.
    expect(closestDomain("public.system.Anything", Object.entries(domains))).toBeNull();
  });
});

describe("the domain nearest a tag, on thin evidence", () => {
  it("is not named from one shared segment", () => {
    // `public` is a namespace; sharing it says nothing about which domain a file tag belongs to.
    expect(closestDomain("public.file.Content", [["system", ["public.system.Site"]]])).toBeNull();
    expect(closestDomain("public.system.Logo", [["system", ["public.system.Site"]]])?.domain).toBe("system");
  });
});

describe("the tags meta.ignoreTags leaves unclaimed", () => {
  const ignored = ignoredTagMatcher(["dev.backoffice", "dev.test.*", "public.file.Content", "ScalarController", "x.**"]);

  it("matches a literal tag whole, and nothing that merely starts with it", () => {
    expect(ignored("dev.backoffice")).toBe(true);
    expect(ignored("ScalarController")).toBe(true);
    expect(ignored("dev.backoffice.Other")).toBe(false);
    expect(ignored("public.file.ContentType")).toBe(false);
  });

  it("matches `*` within one segment and `**` across segments", () => {
    expect(ignored("dev.test.Error")).toBe(true);
    expect(ignored("dev.test.a.Error")).toBe(false);
    expect(ignored("x.y.z.W")).toBe(true);
  });

  it("reads a dot as a dot, and matches nothing without patterns", () => {
    expect(ignoredTagMatcher(["dev.test"])("devXtest")).toBe(false);
    expect(ignoredTagMatcher([])("dev.test.Error")).toBe(false);
  });
});

describe("resolveMeta and a tag no domain claims", () => {
  const tags = ["user.admin.UserAccount", "user.admin.JobPosition", "common.auth.Brand", "dev.test.Error"];
  const resolved = resolveMeta(metaWithTags(tags), { domains, containerTypes: {} });

  it("reports every unclaimed tag with its nearest domain", () => {
    expect(resolved.unmatched.map((one) => [one.tag, one.closest?.domain ?? null])).toEqual([
      ["user.admin.JobPosition", "user"],
      ["common.auth.Brand", "auth"],
      ["dev.test.Error", null],
    ]);
  });

  it("words the warning with the tag, what it costs and where it likely belongs", () => {
    const [job, brand, dev] = resolved.unmatched;
    expect(unclaimedTagMessage(job!)).toBe(
      `Tag 'user.admin.JobPosition' is claimed by no domain in simplix.config.ts, so its 1 operation(s) generate nothing. ` +
        `Closest domain: "user" (shares 'user.admin' with 2 of its patterns); add 'user.admin.JobPosition' to that domain.`,
    );
    expect(unclaimedTagMessage(brand!)).toContain('Closest domain: "auth" (shares \'common.auth\' with 3 of its patterns)');
    expect(unclaimedTagMessage(dev!)).toContain("No domain pattern shares a prefix with it.");
  });
});

describe("simplix meta and a tag no domain claims", () => {
  const claimed = claimedTag;
  const unclaimed = "user.admin.JobPosition";
  let projectDir: string;
  let originalCwd: string;
  let originalExit: typeof process.exit;
  let metaPath: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    originalExit = process.exit;
    process.exit = vi.fn((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never;
    projectDir = await mkdtemp(join(tmpdir(), "meta-unclaimed-"));
    await writeFile(join(projectDir, "simplix.config.ts"), "export default {};\n");
    metaPath = join(projectDir, "source-meta.json");
    await writeFile(metaPath, JSON.stringify(metaWithTags([claimed, unclaimed])));
    config.openapi[0]!.meta.source = metaPath;
    config.openapi[0]!.meta.ignoreTags = [];
    process.chdir(projectDir);
    vi.mocked(log.warn).mockClear();
    vi.mocked(log.error).mockClear();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    process.exit = originalExit;
    await rm(projectDir, { recursive: true, force: true });
  });

  /** Commander keeps the last parse's option values, so each run states every flag it relies on. */
  async function run(...args: string[]): Promise<void> {
    metaCommand.setOptionValue("strict", undefined);
    metaCommand.setOptionValue("offline", undefined);
    await metaCommand.parseAsync(["node", "simplix", ...args]);
  }

  it("warns about the tag, naming the domain it matches best, and carries on", async () => {
    await run();

    expect(vi.mocked(log.warn).mock.calls.map(([line]) => line)).toContain(
      `Tag '${unclaimed}' is claimed by no domain in simplix.config.ts, so its 1 operation(s) generate nothing. ` +
        `Closest domain: "user" (shares 'user.admin' with 1 of its patterns); add '${unclaimed}' to that domain.`,
    );
    expect(log.error).not.toHaveBeenCalled();
  });

  it("exits non-zero under --strict, before anything is written", async () => {
    await expect(run("--strict")).rejects.toThrow("process.exit(1)");

    expect(vi.mocked(log.error).mock.calls.map(([line]) => line).join("\n")).toContain(`--strict: 1 tag(s) are claimed by no domain (${unclaimed})`);
    // Neither the snapshot nor any package was written: the project holds the file it started with.
    expect((await readdir(projectDir)).sort()).toEqual(["simplix.config.ts", "source-meta.json"]);
  });

  it("passes --strict where every tag is claimed", async () => {
    await writeFile(metaPath, JSON.stringify(metaWithTags([claimed])));

    await run("--strict");

    expect(log.error).not.toHaveBeenCalled();
    expect(vi.mocked(log.warn).mock.calls.map(([line]) => String(line)).filter((line) => line.startsWith("Tag '"))).toEqual([]);
  });

  it("passes --strict where the only unclaimed tag is one meta.ignoreTags names, and says it skipped it", async () => {
    config.openapi[0]!.meta.ignoreTags = ["user.admin.*"];

    await run("--strict");

    expect(log.error).not.toHaveBeenCalled();
    expect(vi.mocked(log.warn).mock.calls.map(([line]) => String(line)).filter((line) => line.startsWith("Tag '"))).toEqual([]);
    expect(vi.mocked(log.info).mock.calls.map(([line]) => line)).toContain("1 unclaimed tag(s) skipped by meta.ignoreTags.");
  });
});
