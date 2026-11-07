import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  columnsOf,
  holderColumnsHooksOf,
  listOriginFlags,
  scaffoldOptionsFromOrigin,
  statusBadgeFieldOf,
  type FieldInfo,
} from "../commands/scaffold-crud.js";

const field = (name: string, extra: Partial<FieldInfo> = {}) => ({ name, options: [], ...extra }) as unknown as FieldInfo;

describe("columnsOf", () => {
  it("names the columns a list draws in the order the fields arrive", () => {
    const fields = [field("planName"), field("status"), field("monthlyCredits")];
    expect(columnsOf(fields)).toEqual(["planName", "status", "monthlyCredits"]);
  });

  it("leaves out every field the list's field table skips", () => {
    const fields = [
      field("planId", { isIdentifier: true }),
      field("ownerName", { isReferenceName: true }),
      field("createdAt", { isAuditField: true }),
      field("email", { isUnmasked: true }),
      field("tokenId", { isOpaqueId: true }),
      field("accountId", { hideInList: true }),
      field("name"),
    ];
    expect(columnsOf(fields)).toEqual(["name"]);
  });
});

describe("statusBadgeFieldOf", () => {
  const fields = [field("kind", { contractKind: "enum" }), field("name", { contractKind: "text" }), field("offered", { contractKind: "boolean" })];

  it("takes an enum field the design names", () => {
    expect(statusBadgeFieldOf("kind", fields)).toBe("kind");
  });

  it("takes a boolean field the design names, worded by the entity catalog and toned by Meta", () => {
    expect(statusBadgeFieldOf("offered", fields)).toBe("offered");
  });

  it("is absent when the design names none", () => {
    expect(statusBadgeFieldOf(undefined, fields)).toBeUndefined();
  });

  it("refuses a field that is neither an enum nor a boolean of the record, naming the ones that are", () => {
    expect(() => statusBadgeFieldOf("name", fields)).toThrow("--status-badge name: the badge draws one of the record's enum or boolean fields (kind, offered)");
    expect(() => statusBadgeFieldOf("missing", fields)).toThrow(/enum or boolean fields \(kind, offered\)/);
  });

  it("is recorded in the origin so a regeneration draws the same badge", () => {
    expect(listOriginFlags({ statusBadge: "kind" })).toBe(" --status-badge kind");
    expect(scaffoldOptionsFromOrigin(["plan", "--module", "admin/billing", "--status-badge", "kind"]).statusBadge).toBe("kind");
  });
});

describe("holderColumnsHooksOf", () => {
  let root: string;

  async function moduleWith(path: string, name: string, widgets: Record<string, string>, exportsWidgets = true) {
    const dir = join(root, "modules", ...path.split("/"));
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, "package.json"),
      JSON.stringify({ name, exports: exportsWidgets ? { ".": "./src/index.ts", "./widgets": "./src/widgets/index.ts" } : { ".": "./src/index.ts" } }),
    );
    for (const [entity, source] of Object.entries(widgets)) {
      await mkdir(join(dir, "src/widgets", entity), { recursive: true });
      await writeFile(join(dir, "src/widgets", entity, "list.tsx"), source);
    }
    return dir;
  }

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "holder-columns-"));
    await writeFile(join(root, "simplix.config.ts"), "export default { modules: { groups: [\"admin\"] } };\n");
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("finds each holder's column hook, from its own folder in this module and from another module's widgets entry", async () => {
    const billing = await moduleWith("admin/billing", "@acme/admin-billing", {
      "credit-hold": "export function useCreditHoldColumns() { return []; }\n",
    });
    await moduleWith("admin/user", "@acme/admin-user", {
      "user-note": "export function useUserNoteColumns(overrides?: unknown) { return []; }\n",
    });
    const hooks = await holderColumnsHooksOf(
      root,
      [{ entity: "creditHold", field: "creditAccountId" }, { entity: "userNote", field: "subjectId" }],
      billing,
      ["admin"],
    );
    expect(hooks).toEqual([
      { hook: "useCreditHoldColumns", from: "../credit-hold", field: "creditAccountId" },
      { hook: "useUserNoteColumns", from: "@acme/admin-user/widgets", field: "subjectId" },
    ]);
  });

  it("imports from the package itself where it exports no widgets entry", async () => {
    await moduleWith("admin/user", "@acme/admin-user", { "user-note": "export function useUserNoteColumns() {}\n" }, false);
    const [hook] = await holderColumnsHooksOf(root, [{ entity: "userNote", field: "subjectId" }], undefined, ["admin"]);
    expect(hook?.from).toBe("@acme/admin-user");
  });

  it("answers null, at the holder's index, where no list widget exports the hook", async () => {
    await moduleWith("admin/user", "@acme/admin-user", {
      "user-note": "export function useUserNoteList() {}\n",
    });
    const hooks = await holderColumnsHooksOf(
      root,
      [{ entity: "userNote", field: "subjectId" }, { entity: "creditHold", field: "creditAccountId" }],
      undefined,
      ["admin"],
    );
    expect(hooks).toEqual([null, null]);
  });
});
