import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../utils/logger.js", () => ({
  log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), success: vi.fn(), step: vi.fn() },
}));

import { generateLocaleFiles, pruneStaleGeneratedKeys } from "../commands/openapi.js";

const entity = (name: string, fields: Array<{ name: string; enum?: string[]; enumTypeName?: string }>) =>
  ({ name, pascalName: name[0]!.toUpperCase() + name.slice(1), fields }) as never;

describe("labels the generators no longer write", () => {
  it("drop a removed entity's block, a removed field and an undeclared enum", () => {
    const content = {
      grant: { fields: { roleId: "역할", removedField: "지운 필드" }, _label: "부여" },
      session: { fields: { startedAt: "시작" } },
      enums: { GrantStatus: { ACTIVE: "사용" }, signInOptionType: { SUCCESS: "Success" } },
    };
    const dropped = pruneStaleGeneratedKeys(content, [entity("grant", [{ name: "roleId" }])], {}, new Set(["GrantStatus"]));
    expect(content).toEqual({ grant: { fields: { roleId: "역할" }, _label: "부여" }, enums: { GrantStatus: { ACTIVE: "사용" } } });
    expect(dropped).toEqual(["grant.fields.removedField", "session", "enums.signInOptionType"]);
  });

  it("keep every key that is not in a generator's shape", () => {
    const content = {
      grant: { fields: { roleId: "역할" }, help: "손으로 쓴 안내" },
      screen: { title: "제목" },
      note: "손으로 쓴 문장",
      enums: { InlineStatus: { OPEN: "열림" } },
    };
    const before = structuredClone(content);
    const generated = { enums: { InlineStatus: { OPEN: "Open" } } };
    expect(pruneStaleGeneratedKeys(content, [], generated, new Set())).toEqual([]);
    expect(content).toEqual(before);
  });

  it("prune nothing when the domain's declared types cannot be read", () => {
    const content = { gone: { fields: { a: "A" } }, enums: { Gone: { X: "X" } } };
    expect(pruneStaleGeneratedKeys(content, [], {}, undefined)).toEqual([]);
    expect(content).toEqual({ gone: { fields: { a: "A" } }, enums: { Gone: { X: "X" } } });
  });
});

describe("generateLocaleFiles over an existing catalog", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "simplix-prune-"));
    await mkdir(join(dir, "src/locales"), { recursive: true });
    await mkdir(join(dir, "src/generated-meta/model"), { recursive: true });
    await writeFile(join(dir, "src/generated-meta/model/_enums.ts"), "export type GrantStatus = 'ACTIVE';\n");
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("keeps the translations of what is still generated and drops the rest", async () => {
    const existing = {
      grant: { fields: { roleId: "역할" } },
      securityPolicy: { fields: { lockoutMinutes: "잠금 시간" } },
      enums: { GrantStatus: { ACTIVE: "사용" }, MfaUnavailableReason: { NOT_ENROLLED: "Not Enrolled" } },
      custom: { heading: "손으로 쓴 제목" },
    };
    await writeFile(join(dir, "src/locales/ko.json"), JSON.stringify(existing));
    await generateLocaleFiles(dir, [entity("grant", [{ name: "roleId" }, { name: "status" }])], ["ko"]);
    const ko = JSON.parse(await readFile(join(dir, "src/locales/ko.json"), "utf-8"));
    expect(ko).toEqual({
      grant: { fields: { roleId: "역할", status: "Status" } },
      enums: { GrantStatus: { ACTIVE: "사용" } },
      custom: { heading: "손으로 쓴 제목" },
    });
  });
});
