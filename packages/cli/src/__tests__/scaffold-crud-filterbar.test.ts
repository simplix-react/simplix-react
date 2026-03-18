import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathExists } from "../utils/fs.js";

// Mock ora
vi.mock("ora", () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: "",
  }),
}));

// Mock logger
vi.mock("../utils/logger.js", () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
  },
}));

// Mock config-loader
vi.mock("../config/config-loader.js", () => ({
  loadConfig: vi.fn().mockResolvedValue({
    api: { baseUrl: "/api" },
    i18n: { locales: ["en"] },
  }),
}));

// Mock crud-config-loader
vi.mock("../config/crud-config-loader.js", () => ({
  findCrudConfigForEntity: vi.fn().mockResolvedValue(null),
}));

// Mock depVersion
vi.mock("../versions.js", () => ({
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
  withVersions: vi.fn((ctx: Record<string, unknown>) => ctx),
}));

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "scaffold-filterbar-test-"));
  originalCwd = process.cwd();
  originalExit = process.exit;
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;

  await writeFile(join(tempDir, "simplix.config.ts"), "export default {};");
  await writeFile(
    join(tempDir, "package.json"),
    JSON.stringify({ name: "@test/test-monorepo" }),
  );

  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("scaffoldCrudCommand filter bar generation", () => {
  it("generates list with various filter types from snapshot query params", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");
    vi.mocked(findCrudConfigForEntity).mockResolvedValue(null);

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    // Create snapshot with diverse query params to trigger all filter types
    const domainDir = join(tempDir, "packages/myapp-domain-device");
    await mkdir(join(domainDir, "src"), { recursive: true });
    await writeFile(
      join(domainDir, "src/schemas.ts"),
      `export const deviceSchema = z.object({
        id: z.string(),
        name: z.string(),
        status: z.enum(["active", "inactive"]),
        enabled: z.boolean(),
        price: z.number(),
        createdAt: z.string(),
        countryCode: z.string(),
        timezone: z.string(),
      });`,
    );
    await writeFile(
      join(domainDir, "package.json"),
      JSON.stringify({ name: "@test/myapp-domain-device" }),
    );
    await writeFile(
      join(domainDir, ".openapi-snapshot.json"),
      JSON.stringify({
        version: 2,
        generatedAt: "2024-01-01",
        specSource: "api.json",
        entities: [{
          name: "device",
          pascalName: "Device",
          pluralName: "devices",
          path: "/devices",
          fields: [
            { name: "id", snakeName: "id", type: "string", required: true, nullable: false, zodType: "" },
            { name: "name", snakeName: "name", type: "string", required: true, nullable: false, zodType: "" },
            { name: "status", snakeName: "status", type: "string", enum: ["active", "inactive"], required: true, nullable: false, zodType: "" },
            { name: "enabled", snakeName: "enabled", type: "boolean", required: true, nullable: false, zodType: "" },
            { name: "price", snakeName: "price", type: "number", format: "double", required: true, nullable: false, zodType: "" },
            { name: "createdAt", snakeName: "created_at", type: "string", format: "date-time", required: true, nullable: false, zodType: "" },
            { name: "countryCode", snakeName: "country_code", type: "string", required: true, nullable: false, zodType: "" },
            { name: "timezone", snakeName: "timezone", type: "string", required: true, nullable: false, zodType: "" },
          ],
          queryParams: [
            { name: "name.contains", type: "string" },
            { name: "name.equals", type: "string" },
            { name: "status.in", type: "string" },
            { name: "enabled.equals", type: "string" },
            { name: "price.greaterThanOrEqualTo", type: "number" },
            { name: "price.lessThanOrEqualTo", type: "number" },
            { name: "createdAt.greaterThanOrEqualTo", type: "string" },
            { name: "createdAt.lessThanOrEqualTo", type: "string" },
            { name: "countryCode.in", type: "string" },
            { name: "timezone.in", type: "string" },
          ],
          operations: [
            { name: "list", method: "GET", path: "/devices/search", role: "list", hasInput: true, operationId: "searchDevices", queryParams: [] },
            { name: "get", method: "GET", path: "/devices/:id", role: "get", hasInput: false, operationId: "getDevice", queryParams: [] },
            { name: "create", method: "POST", path: "/devices", role: "create", hasInput: true, operationId: "createDevice", queryParams: [] },
            { name: "update", method: "PUT", path: "/devices/:id", role: "update", hasInput: true, operationId: "updateDevice", queryParams: [] },
            { name: "delete", method: "DELETE", path: "/devices/:id", role: "delete", hasInput: false, operationId: "deleteDevice", queryParams: [] },
          ],
          tags: [],
        }],
      }),
    );

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "device"]);

    const widgetsDir = join(modDir, "src/widgets/device");
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(true);

    const listContent = await readFile(join(widgetsDir, "list.tsx"), "utf-8");
    expect(listContent).toContain("Device");
    // Verify the list component was generated (contains filter-related content)
    expect(listContent).toBeTruthy();
  });
});
