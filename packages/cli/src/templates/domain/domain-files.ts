// Domain package template files — simplix.config.ts-based architecture
// Uses defineApi + deriveHooks + deriveMockHandlers instead of manual boilerplate

export const domainPackageJson = `{
  "name": "{{domainPkgName}}",
  "version": "0.0.1",
  "description": "{{PascalName}} domain API and mock for {{projectName}}",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./mock": {
      "types": "./dist/mock.d.ts",
      "import": "./dist/mock.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "test": "vitest run --passWithNoTests",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "simplix-react": "{{fw.meta}}",
    "@tanstack/react-query": "{{deps.tanstackReactQuery}}",
    "zod": "{{deps.zod}}"
  },
  "devDependencies": {
    "@electric-sql/pglite": "{{deps.electricSqlPglite}}",
    "msw": "{{deps.msw}}",
    "tsup": "{{deps.tsup}}",
    "typescript": "{{deps.typescript}}",
    "vitest": "{{deps.vitest}}"
  }
}
`;

export const domainTsupConfig = `import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
    },
    format: ["esm"],
    dts: true,
    external: [/^@/, /^react/, /^zod/],
  },
  {
    entry: { mock: "src/mock/index.ts" },
    format: ["esm"],
    dts: true,
    external: [/^@/, /^msw/, /^@electric-sql/],
  },
]);
`;

export const domainTsconfigJson = `{
  "extends": "../../config/typescript/react.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`;

export const domainIndexTs = `export * from "./contract.js";
export * from "./hooks.js";
`;

export const domainContractTs = `import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

{{#each entities}}
export const {{entityName}}Schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const create{{EntityPascal}}Schema = {{entityName}}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const update{{EntityPascal}}Schema = create{{EntityPascal}}Schema.partial();

export type {{EntityPascal}} = z.infer<typeof {{entityName}}Schema>;
export type Create{{EntityPascal}} = z.infer<typeof create{{EntityPascal}}Schema>;
export type Update{{EntityPascal}} = z.infer<typeof update{{EntityPascal}}Schema>;

{{/each}}
export const {{domainName}}Api = defineApi({
  domain: "{{domainName}}",
  basePath: "{{apiBasePath}}",
  entities: {
{{#each entities}}
    {{entityName}}: {
      path: "/{{entityName}}s",
      schema: {{entityName}}Schema,
      createSchema: create{{EntityPascal}}Schema,
      updateSchema: update{{EntityPascal}}Schema,
    },
{{/each}}
  },
  queryBuilder: simpleQueryBuilder,
});
`;

export const domainHooksTs = `import { deriveHooks } from "@simplix-react/react";
import { {{domainName}}Api } from "./contract.js";

export const {{domainName}}Hooks = deriveHooks({{domainName}}Api);
`;

export const domainMockIndexTs = `import type { MockDomainConfig } from "@simplix-react/mock";
import { executeSql } from "@simplix-react/mock";
import { handlers } from "./handlers.js";
import { migrations as migrationSql } from "./migrations.js";
import { seed } from "./seed.js";

export const {{domainName}}Mock: MockDomainConfig = {
  name: "{{domainName}}",
  handlers,
  migrations: [
    async (db) => {
      for (const sql of migrationSql) { await executeSql(db, sql); }
    },
  ],
  seed: [seed],
};
`;

export const domainMockHandlersTs = `import type { HttpHandler } from "msw";
import { deriveMockHandlers } from "@simplix-react/mock";
import { {{domainName}}Api } from "../contract.js";

export const handlers: HttpHandler[] = deriveMockHandlers({{domainName}}Api.config);
`;

export const domainMockMigrationsTs = `export const migrations = [
{{#each entities}}
  \`CREATE TABLE IF NOT EXISTS {{../domainName}}_{{entityName}}s (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )\`,
{{/each}}
];
`;

export const domainMockSeedTs = `import type { PGlite } from "@electric-sql/pglite";

export async function seed(_db: PGlite): Promise<void> {
  // Add your seed data here
}
`;
