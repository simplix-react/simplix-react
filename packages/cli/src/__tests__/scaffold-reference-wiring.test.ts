import { mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { manifestsOf } from "../commands/generated.js";
import { ensureModuleDeps, unreadPeekEntriesOf, withContractKinds, type FieldInfo } from "../commands/scaffold-crud.js";

function moduleDir(dependencies: Record<string, string>): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "module-deps-")));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "@app/admin-billing", dependencies }, null, 2));
  return dir;
}

/** A detail whose holder sub-list reads another domain's list hook. */
const DETAIL = [
  'import { useGetCreditHold } from "@app/domain-billing";',
  'import { listSpeechResultsAccess, useListSpeechResults } from "@app/domain-speech";',
  "export const x = [useGetCreditHold, listSpeechResultsAccess, useListSpeechResults];",
].join("\n");

describe("the dependencies a scaffold declares for its module", () => {
  it("include every domain package a rendered file imports, a holder's domain beside the entity's own", async () => {
    const dir = moduleDir({});
    const added = await ensureModuleDeps(dir, ["@app/domain-billing", "@app/domain-speech"], null, [DETAIL]);
    expect(added).toEqual(expect.arrayContaining(["@app/domain-billing@workspace:*", "@app/domain-speech@workspace:*"]));
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8")) as { dependencies: Record<string, string> };
    expect(pkg.dependencies["@app/domain-speech"]).toBe("workspace:*");
  });

  it("leave out a domain no file imports and one already declared", async () => {
    const dir = moduleDir({ "@app/domain-billing": "workspace:*" });
    const added = await ensureModuleDeps(dir, ["@app/domain-billing", "@app/domain-voice"], null, [DETAIL]);
    expect(added.filter((one) => one.startsWith("@app/"))).toEqual([]);
  });
});

describe("the manifest a named regeneration writes beside the files", () => {
  const tree = () => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), "manifests-")));
    const module = join(root, "modules", "admin", "billing");
    mkdirSync(join(module, "src", "widgets", "credit-hold"), { recursive: true });
    writeFileSync(join(root, "package.json"), "{}");
    writeFileSync(join(module, "package.json"), "{}");
    return { root, module, file: join(module, "src", "widgets", "credit-hold", "detail.tsx") };
  };

  it("is the file's own module manifest, where the render changed it", async () => {
    const { root, module, file } = tree();
    const written = new Map([[join(module, "package.json"), '{"dependencies":{}}']]);
    expect([...(await manifestsOf(root, [file], written)).keys()]).toEqual([join(module, "package.json")]);
  });

  it("is none where the render left the manifest alone, and never a manifest above the module's", async () => {
    const { root, file } = tree();
    expect((await manifestsOf(root, [file], new Map())).size).toBe(0);
    const above = new Map([[join(root, "package.json"), '{"dependencies":{}}']]);
    expect((await manifestsOf(root, [file], above)).size).toBe(0);
  });
});

const declared = (name: string, target: string): FieldInfo =>
  ({
    name,
    capitalizedName: name,
    label: name,
    tsType: "string",
    formComponent: "TextField",
    inputType: "text",
    component: "Input",
    options: [],
    defaultValue: '""',
    isForeignKey: true,
    fkEntityField: name.slice(0, -2),
    isSystemField: false,
    isI18nPair: false,
    baseFieldName: null,
    referenceDeclared: true,
    referencePeekKind: target,
  }) as FieldInfo;

describe("the peek a declared reference opens", () => {
  it("is the entity Meta names, mapped by an entry keyed by that entity", () => {
    const [role] = withContractKinds([declared("roleId", "userRole")], "grantId", { peeks: { userRole: "role" } });
    expect(role?.peekKind).toBe("role");
    expect(unreadPeekEntriesOf([role!], { userRole: "role" })).toEqual([]);
  });

  it("is reported where a stem entry names another kind, which a declared reference does not read", () => {
    const [role] = withContractKinds([declared("roleId", "userRole")], "grantId", { peeks: { role: "role" } });
    expect(role?.peekKind).toBe("userRole");
    expect(unreadPeekEntriesOf([role!], { role: "role" })).toEqual([expect.stringContaining('"roleId" opens peek kind "userRole"')]);
  });

  it("is quiet where the stem entry names the kind the reference opens", () => {
    const [user] = withContractKinds([declared("userId", "userAccount")], "noteId", { peeks: { user: "userAccount" } });
    expect(unreadPeekEntriesOf([user!], { user: "userAccount" })).toEqual([]);
  });
});
