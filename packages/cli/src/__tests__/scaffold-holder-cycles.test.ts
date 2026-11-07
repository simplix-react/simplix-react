import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

import { cycleThrough, packageCycles, readPackageGraph } from "../checks/package-cycles.js";
import { describePackageCycles } from "../commands/cycles.js";
import { ensureModuleDeps, excludeHolders, screenHoldersOf, withoutCyclicHolders } from "../commands/scaffold-crud.js";
import type { MetaHolderSource, MetaScaffoldSource } from "../meta/scaffold-source.js";

/**
 * A workspace shaped like the one the defect came from: the billing module fills a slot the user
 * module offers, so billing declares user. An account's detail held by billing's credit accounts
 * and by the user module's own notes must not import billing back.
 */
let root: string;

function write(path: string, text: string): void {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), text);
}

function manifest(dir: string, name: string, dependencies: Record<string, string> = {}): void {
  write(`${dir}/package.json`, JSON.stringify({ name, exports: { ".": "./src/index.ts", "./widgets": "./src/widgets/index.ts" }, dependencies }, null, 2));
}

function columnsHook(dir: string, kebab: string, pascal: string): void {
  write(`${dir}/src/widgets/${kebab}/list.tsx`, `export function use${pascal}Columns() { return []; }\n`);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "holder-cycles-"));
  write("pnpm-workspace.yaml", "packages:\n  - packages/*\n  - modules/*/*\n");
  manifest("packages/domain-user", "@w/domain-user");
  manifest("packages/domain-billing", "@w/domain-billing");
  manifest("packages/identity-ui", "@w/identity-ui", { "@w/domain-user": "workspace:*" });
  manifest("modules/admin/user", "@w/admin-user", { "@w/identity-ui": "workspace:*", "@w/domain-user": "workspace:*" });
  // Billing reaches the user module through the slot it fills.
  manifest("modules/admin/billing", "@w/admin-billing", { "@w/admin-user": "workspace:*", "@w/domain-billing": "workspace:*" });
  manifest("modules/admin/jobs", "@w/admin-jobs", { "@w/domain-user": "workspace:*" });
  columnsHook("modules/admin/billing", "credit-account", "CreditAccount");
  columnsHook("modules/admin/user", "user-note", "UserNote");
  columnsHook("modules/admin/jobs", "background-job", "BackgroundJob");
});

function holder(entity: string, field: string): MetaHolderSource {
  const source = { roles: { list: `${entity}List` }, fields: [], rowIdField: "id", entity } as unknown as MetaScaffoldSource;
  return { entity, field, operator: "equals", source };
}

const PACKAGES: Record<string, string> = { creditAccount: "@w/domain-billing", userNote: "@w/domain-user", backgroundJob: "@w/domain-user" };

async function accountHolders(exclude?: string[]) {
  return screenHoldersOf({
    rootDir: root,
    entity: "userAccount",
    metaHolders: [holder("creditAccount", "userId"), holder("userNote", "userId"), holder("userNote", "authorId"), holder("backgroundJob", "userId")],
    moduleDir: join(root, "modules/admin/user"),
    groups: ["admin"],
    exclude,
    context: { packageOf: async (entity) => PACKAGES[entity] ?? null },
  });
}

describe("the workspace package graph", () => {
  it("reads every member the workspace globs name, with the workspace packages each declares", () => {
    const graph = readPackageGraph(root);
    expect([...graph.keys()].sort()).toEqual(["@w/admin-billing", "@w/admin-jobs", "@w/admin-user", "@w/domain-billing", "@w/domain-user", "@w/identity-ui"]);
    expect(graph.get("@w/admin-billing")?.dependsOn).toEqual(["@w/admin-user", "@w/domain-billing"]);
  });

  it("names the path a new edge would come back by, and nothing for an edge that closes no ring", () => {
    const graph = readPackageGraph(root);
    expect(cycleThrough(graph, "@w/admin-user", "@w/admin-billing")).toEqual(["@w/admin-billing", "@w/admin-user"]);
    expect(cycleThrough(graph, "@w/domain-user", "@w/admin-billing")).toEqual(["@w/admin-billing", "@w/admin-user", "@w/domain-user"]);
    expect(cycleThrough(graph, "@w/admin-user", "@w/admin-jobs")).toBeUndefined();
    expect(cycleThrough(graph, "@w/admin-user", "@w/domain-billing")).toBeUndefined();
  });

  it("finds no cycle in an acyclic workspace and the ring once a package.json closes one", () => {
    expect(packageCycles(readPackageGraph(root))).toEqual([]);
    expect(describePackageCycles(root, readPackageGraph(root)).failed).toBe(false);
    manifest("modules/admin/user", "@w/admin-user", { "@w/identity-ui": "workspace:*", "@w/admin-billing": "workspace:*" });
    const graph = readPackageGraph(root);
    expect(packageCycles(graph)).toEqual([["@w/admin-billing", "@w/admin-user"]]);
    const report = describePackageCycles(root, graph);
    expect(report.failed).toBe(true);
    expect(report.errors[0]).toContain("@w/admin-billing (modules/admin/billing) -> @w/admin-user (modules/admin/user) -> @w/admin-billing");
  });
});

describe("the holders a detail draws", () => {
  it("leaves out a holder whose module already depends on the screen's module, and keeps the rest", async () => {
    const result = await accountHolders();
    expect(result.holders.map((one) => `${one.entity}.${one.field}`)).toEqual(["userNote.userId", "userNote.authorId", "backgroundJob.userId"]);
    expect(result.holderColumnsHooks.map((one) => one?.from)).toEqual(["../user-note", "../user-note", "@w/admin-jobs/widgets"]);
    expect(result.dropped).toEqual([{ entity: "creditAccount", field: "userId", module: "@w/admin-billing", ring: ["@w/admin-billing", "@w/admin-user"] }]);
  });

  it("leaves out what the screen's exclusion list names, by entity or by entity and field", async () => {
    const result = await accountHolders(["backgroundJob", "userNote.authorId", "subscription"]);
    expect(result.holders.map((one) => `${one.entity}.${one.field}`)).toEqual(["userNote.userId"]);
    expect(result.holderColumnsHooks).toHaveLength(1);
    expect(result.unmatched).toEqual(["subscription"]);
  });

  it("keeps a holder in another module that does not reach the screen's module", () => {
    const graph = readPackageGraph(root);
    const kept = withoutCyclicHolders([{ entity: "backgroundJob", field: "userId" }], [{ hook: "useBackgroundJobColumns", from: "@w/admin-jobs/widgets", field: "userId" }], "@w/admin-user", graph);
    expect(kept.dropped).toEqual([]);
    expect(kept.holders).toHaveLength(1);
  });

  it("matches an exclusion entry against the entity or the entity and its field only", () => {
    const holders = [{ entity: "userNote", field: "userId" }, { entity: "userNote", field: "authorId" }];
    expect(excludeHolders(holders, ["userNote.authorId"]).kept).toEqual([{ entity: "userNote", field: "userId" }]);
    expect(excludeHolders(holders, ["user"]).kept).toHaveLength(2);
    expect(excludeHolders(holders).unmatched).toEqual([]);
  });
});

describe("the dependencies a scaffold adds to its module", () => {
  const imports = ['import { useCreditAccountColumns } from "@w/admin-billing/widgets";', 'import { useListCreditAccount } from "@w/domain-billing";'];

  it("refuses a workspace dependency that would close a cycle and adds one that does not", async () => {
    const moduleDir = join(root, "modules/admin/user");
    const added = await ensureModuleDeps(moduleDir, ["@w/admin-billing", "@w/domain-billing"], null, imports, readPackageGraph(root));
    expect(added).toEqual(["@w/domain-billing@workspace:*"]);
    const deps = (JSON.parse(readFileSync(join(moduleDir, "package.json"), "utf-8")) as { dependencies: Record<string, string> }).dependencies;
    expect(deps["@w/admin-billing"]).toBeUndefined();
    expect(packageCycles(readPackageGraph(root))).toEqual([]);
  });
});
