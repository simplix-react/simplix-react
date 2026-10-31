import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ConfigLoadError } from "../config/config-load-error.js";
import { findCrudConfigForEntity, loadCrudMap } from "../config/crud-config-loader.js";

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

  it("raises ConfigLoadError for a crud.config.ts that exists but cannot be loaded", async () => {
    const pkgsDir = join(tempDir, "packages/my-domain");
    await mkdir(pkgsDir, { recursive: true });
    const configPath = join(pkgsDir, "crud.config.ts");
    await writeFile(
      configPath,
      `import { missing } from 'nonexistent-pkg'; export default { user: missing };`,
    );

    const failure = await findCrudConfigForEntity(tempDir, "user").then(
      () => null,
      (err: unknown) => err,
    );

    expect(failure).toBeInstanceOf(ConfigLoadError);
    const error = failure as ConfigLoadError;
    expect(error.path).toBe(configPath);
    expect(error.message).toContain(configPath);
    expect(error.message).toContain("nonexistent-pkg");
    expect(error.cause).toBeInstanceOf(Error);
  });

  it.each([
    ["an expression that throws", `throw new Error("crud boom");\nexport default {};\n`, "crud boom"],
    ["a syntax error", `export default { user: { list: "listUsers" ;\n`, ""],
  ])("raises ConfigLoadError for %s", async (_name, source, reason) => {
    const pkgsDir = join(tempDir, "packages/my-domain");
    await mkdir(pkgsDir, { recursive: true });
    const configPath = join(pkgsDir, "crud.config.ts");
    await writeFile(configPath, source);

    await expect(findCrudConfigForEntity(tempDir, "user")).rejects.toMatchObject({
      name: "ConfigLoadError",
      path: configPath,
      message: expect.stringContaining(reason),
    });
  });

  it("raises for a broken crud.config.ts even when another package defines the entity", async () => {
    // The entity's roles may be in the file that failed, so a lookup that skipped it would answer
    // "no override" for an entity that has one.
    const broken = join(tempDir, "packages/a-broken");
    const sound = join(tempDir, "packages/b-sound");
    await mkdir(broken, { recursive: true });
    await mkdir(sound, { recursive: true });
    await writeFile(join(broken, "crud.config.ts"), `throw new Error("sibling boom");\n`);
    await writeFile(
      join(sound, "crud.config.ts"),
      `export default { user: { list: "listUsers" } };`,
    );

    await expect(findCrudConfigForEntity(tempDir, "user")).rejects.toThrow(ConfigLoadError);
  });
});

describe("loadCrudMap", () => {
  it("yields the empty map for a crud.config.ts that does not exist", async () => {
    await expect(loadCrudMap(join(tempDir, "packages/none/crud.config.ts"))).resolves.toEqual({});
  });

  it("yields the map a crud.config.ts exports", async () => {
    const pkgsDir = join(tempDir, "packages/my-domain");
    await mkdir(pkgsDir, { recursive: true });
    const configPath = join(pkgsDir, "crud.config.ts");
    await writeFile(configPath, `export default { user: { list: "listUsers" } };`);

    await expect(loadCrudMap(configPath)).resolves.toEqual({ user: { list: "listUsers" } });
  });

  it("raises ConfigLoadError naming the path and carrying the original error as its cause", async () => {
    const pkgsDir = join(tempDir, "packages/my-domain");
    await mkdir(pkgsDir, { recursive: true });
    const configPath = join(pkgsDir, "crud.config.ts");
    await writeFile(configPath, `throw new TypeError("shape boom");\n`);

    const failure = await loadCrudMap(configPath).then(
      () => null,
      (err: unknown) => err,
    );

    expect(failure).toBeInstanceOf(ConfigLoadError);
    const error = failure as ConfigLoadError;
    expect(error.message).toBe(`Cannot load ${configPath}: TypeError: shape boom`);
    expect(error.cause).toBeInstanceOf(TypeError);
  });
});
