import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { findCrudConfigForEntity } from "../config/crud-config-loader.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "crud-config-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("findCrudConfigForEntity", () => {
  it("returns null when packages dir does not exist", async () => {
    const result = await findCrudConfigForEntity(tempDir, "user");
    expect(result).toBeNull();
  });

  it("returns null when no crud.config.ts exists", async () => {
    const pkgsDir = join(tempDir, "packages/my-domain");
    await mkdir(pkgsDir, { recursive: true });

    const result = await findCrudConfigForEntity(tempDir, "user");
    expect(result).toBeNull();
  });

  it("loads entity config from crud.config.ts", async () => {
    const pkgsDir = join(tempDir, "packages/my-domain");
    await mkdir(pkgsDir, { recursive: true });
    await writeFile(
      join(pkgsDir, "crud.config.ts"),
      `export default { user: { list: "listUsers", get: "getUser", create: "createUser" } };`,
    );

    const result = await findCrudConfigForEntity(tempDir, "user");
    expect(result).toBeTruthy();
    expect(result?.list).toBe("listUsers");
    expect(result?.get).toBe("getUser");
    expect(result?.create).toBe("createUser");
  });

  it("returns null for entity not in crud.config.ts", async () => {
    const pkgsDir = join(tempDir, "packages/my-domain");
    await mkdir(pkgsDir, { recursive: true });
    await writeFile(
      join(pkgsDir, "crud.config.ts"),
      `export default { product: { list: "listProducts" } };`,
    );

    const result = await findCrudConfigForEntity(tempDir, "user");
    expect(result).toBeNull();
  });

  it("handles invalid crud.config.ts gracefully", async () => {
    const pkgsDir = join(tempDir, "packages/my-domain");
    await mkdir(pkgsDir, { recursive: true });
    await writeFile(
      join(pkgsDir, "crud.config.ts"),
      `import { missing } from 'nonexistent-pkg'; export default {};`,
    );

    const result = await findCrudConfigForEntity(tempDir, "user");
    expect(result).toBeNull();
  });
});
