import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { ValidationResult } from "../commands/validate.js";
import { validateContractRules } from "../validators/contract-rules.js";

let tempDir: string;

function createResult(path: string): ValidationResult {
  return { path, errors: [], warnings: [], passes: [] };
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "simplix-contract-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("validateContractRules", () => {
  it("returns early when no contract file is found", async () => {
    await mkdir(join(tempDir, "src"), { recursive: true });

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });

  it("returns early when contract file does not use defineApi", async () => {
    const contractDir = join(tempDir, "src", "api");
    await mkdir(contractDir, { recursive: true });
    await writeFile(
      join(contractDir, "contract.ts"),
      'export const config = { domain: "test" };',
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });

  it("returns early when no entities are found in contract", async () => {
    const contractDir = join(tempDir, "src", "api");
    await mkdir(contractDir, { recursive: true });
    await writeFile(
      join(contractDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";

export const api = defineApi({
  domain: "test",
  basePath: "/api/v1",
});
`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });

  it("passes when all entities have complete schemas", async () => {
    const contractDir = join(tempDir, "src", "api");
    await mkdir(contractDir, { recursive: true });
    await writeFile(
      join(contractDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string(), title: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
  },
});
`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
    expect(result.passes.some((p) => p.includes("All entities have complete schemas"))).toBe(true);
  });

  it("errors when entity is missing required schema fields", async () => {
    const contractDir = join(tempDir, "src", "api");
    await mkdir(contractDir, { recursive: true });
    await writeFile(
      join(contractDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string() }),
    },
  },
});
`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.errors.some((e) => e.includes("task") && e.includes("createSchema"))).toBe(true);
    expect(result.errors.some((e) => e.includes("task") && e.includes("updateSchema"))).toBe(true);
  });

  it("validates operations have input and output", async () => {
    const contractDir = join(tempDir, "src", "api");
    await mkdir(contractDir, { recursive: true });
    await writeFile(
      join(contractDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
  },
  operations: {
    assignTask: {
      method: "POST",
      path: "/tasks/:id/assign",
      input: z.object({ userId: z.string() }),
      output: z.object({ success: z.boolean() }),
    },
  },
});
`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.errors.filter((e) => e.includes("Operation"))).toHaveLength(0);
    expect(result.passes.some((p) => p.includes("All operations have input + output"))).toBe(true);
  });

  it("errors when operation is missing input or output", async () => {
    const contractDir = join(tempDir, "src", "api");
    await mkdir(contractDir, { recursive: true });
    await writeFile(
      join(contractDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
  },
  operations: {
    assignTask: {
      method: "POST",
      path: "/tasks/:id/assign",
    },
  },
});
`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.errors.some((e) => e.includes("assignTask") && e.includes("input"))).toBe(true);
    expect(result.errors.some((e) => e.includes("assignTask") && e.includes("output"))).toBe(true);
  });

  it("warns when no mock handlers file exists", async () => {
    const contractDir = join(tempDir, "src", "api");
    await mkdir(contractDir, { recursive: true });
    await writeFile(
      join(contractDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
  },
});
`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.warnings.some((w) => w.includes("No mock handlers file found"))).toBe(true);
  });

  it("passes when handlers use deriveMockHandlers with .config", async () => {
    const contractDir = join(tempDir, "src", "api");
    const mockDir = join(tempDir, "src", "mock");
    await mkdir(contractDir, { recursive: true });
    await mkdir(mockDir, { recursive: true });

    await writeFile(
      join(contractDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
  },
});
`,
    );

    await writeFile(
      join(mockDir, "handlers.ts"),
      `
import { deriveMockHandlers } from "@simplix-react/mock";
import { api } from "../api/contract";

export const handlers = deriveMockHandlers(api.config, {
  task: { tableName: "tasks" },
});
`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.passes.some((p) => p.includes("mock handler config") && p.includes("derived from contract"))).toBe(true);
  });

  it("warns when handlers.ts does not use deriveMockHandlers", async () => {
    const contractDir = join(tempDir, "src", "api");
    const mockDir = join(tempDir, "src", "mock");
    await mkdir(contractDir, { recursive: true });
    await mkdir(mockDir, { recursive: true });

    await writeFile(
      join(contractDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
  },
});
`,
    );

    await writeFile(
      join(mockDir, "handlers.ts"),
      `export const handlers = [];`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.warnings.some((w) => w.includes("does not use deriveMockHandlers"))).toBe(true);
  });

  it("errors when entity has no mock handler config in handlers.ts", async () => {
    const contractDir = join(tempDir, "src", "api");
    const mockDir = join(tempDir, "src", "mock");
    await mkdir(contractDir, { recursive: true });
    await mkdir(mockDir, { recursive: true });

    await writeFile(
      join(contractDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
    member: {
      path: "/members",
      schema: z.object({ id: z.string() }),
      createSchema: z.object({ name: z.string() }),
      updateSchema: z.object({ name: z.string().optional() }),
    },
  },
});
`,
    );

    await writeFile(
      join(mockDir, "handlers.ts"),
      `
import { deriveMockHandlers } from "@simplix-react/mock";

export const handlers = deriveMockHandlers(api, {
  task: {
    tableName: "tasks",
  },
});
`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    expect(result.errors.some((e) => e.includes("member") && e.includes("no mock handler config"))).toBe(true);
  });

  it("finds contract at src/contract.ts fallback path", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });
    await writeFile(
      join(srcDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const api = defineApi({
  domain: "test",
  basePath: "/api",
  entities: {
    item: {
      path: "/items",
      schema: z.object({ id: z.string() }),
      createSchema: z.object({ name: z.string() }),
      updateSchema: z.object({ name: z.string().optional() }),
    },
  },
});
`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    // It found the contract and validated it (should have at least a pass or warning about mock handlers)
    expect(result.passes.length + result.warnings.length).toBeGreaterThan(0);
  });

  it("validates multiple entities independently", async () => {
    const contractDir = join(tempDir, "src", "api");
    await mkdir(contractDir, { recursive: true });
    await writeFile(
      join(contractDir, "contract.ts"),
      `
import { defineApi } from "@simplix-react/contract";
import { z } from "zod";

export const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string() }),
      createSchema: z.object({ title: z.string() }),
      updateSchema: z.object({ title: z.string().optional() }),
    },
    member: {
      path: "/members",
      schema: z.object({ id: z.string() }),
    },
  },
});
`,
    );

    const result = createResult(tempDir);
    await validateContractRules(tempDir, result);

    // task is complete, member is missing createSchema and updateSchema
    expect(result.errors.some((e) => e.includes("member") && e.includes("createSchema"))).toBe(true);
    expect(result.errors.some((e) => e.includes("member") && e.includes("updateSchema"))).toBe(true);
    // task should NOT be in errors
    expect(result.errors.some((e) => e.includes("task"))).toBe(false);
  });
});
