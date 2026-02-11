// OpenAPI-generated domain package templates
// Uses defineApi + deriveHooks + deriveMockHandlers instead of manual boilerplate
// Uses Handlebars syntax — rendered via renderTemplate()

export const openapiPackageJsonWithEslintConfig = `{
  "name": "{{domainPkgName}}",
  "version": "0.0.1",
  "description": "{{PascalName}} domain API and mock for {{projectName}} (OpenAPI-generated)",
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
    "@simplix-react/contract": "{{fw.contract}}",
    "@simplix-react/react": "{{fw.react}}",
    "@tanstack/react-query": "{{deps.tanstackReactQuery}}",
    "zod": "{{deps.zod}}"
  },
  "devDependencies": {
    "{{configEslintPkgName}}": "workspace:*",
    "@simplix-react/mock": "{{fw.mock}}",
    "@electric-sql/pglite": "{{deps.electricSqlPglite}}",
    "eslint": "{{deps.eslint}}",
    "msw": "{{deps.msw}}",
    "tsup": "{{deps.tsup}}",
    "typescript": "{{deps.typescript}}",
    "vitest": "{{deps.vitest}}"
  }
}
`;

export const openapiPackageJsonStandalone = `{
  "name": "{{domainPkgName}}",
  "version": "0.0.1",
  "description": "{{PascalName}} domain API and mock for {{projectName}} (OpenAPI-generated)",
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
    "@simplix-react/contract": "{{fw.contract}}",
    "@simplix-react/react": "{{fw.react}}",
    "@tanstack/react-query": "{{deps.tanstackReactQuery}}",
    "zod": "{{deps.zod}}"
  },
  "devDependencies": {
    "@simplix-react/mock": "{{fw.mock}}",
    "@electric-sql/pglite": "{{deps.electricSqlPglite}}",
    "@typescript-eslint/eslint-plugin": "{{deps.typescriptEslintEslintPlugin}}",
    "@typescript-eslint/parser": "{{deps.typescriptEslintParser}}",
    "eslint": "{{deps.eslint}}",
    "msw": "{{deps.msw}}",
    "tsup": "{{deps.tsup}}",
    "typescript": "{{deps.typescript}}",
    "vitest": "{{deps.vitest}}"
  }
}
`;

export const openapiTsupConfig = `import { defineConfig } from "tsup";

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

export const openapiEslintConfigShared = `export { default } from "{{configEslintPkgName}}";
`;

export const openapiEslintConfigStandalone = `import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  },
];
`;

export const openapiTsconfigJson = `{
  "extends": "../../config/typescript/react.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`;

// --- User-owned files (scaffold, first-run only) ---

export const openapiUserIndexTs = `export * from "./generated/index.js";
`;

export const openapiUserMockIndexTs = `export { handlers } from "./generated/handlers.js";
export { migrations } from "./generated/migrations.js";
export { seed } from "./seed.js";
`;

// --- Machine-generated files (always regenerated) ---

export const openapiGeneratedIndexTs = `export * from "./schemas.js";
export * from "./contract.js";
export * from "./hooks.js";
`;

export const openapiGeneratedContractTs = `import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
{{#each entities}}
import { {{name}}Schema, create{{pascalName}}Schema, update{{pascalName}}Schema } from "./schemas.js";
{{/each}}

export const {{domainName}}Api = defineApi({
  domain: "{{domainName}}",
  basePath: "{{apiBasePath}}",
  entities: {
{{#each entities}}
    {{name}}: {
      path: "{{path}}",
      schema: {{name}}Schema,
      createSchema: create{{pascalName}}Schema,
      updateSchema: update{{pascalName}}Schema,
    },
{{/each}}
  },
  queryBuilder: simpleQueryBuilder,
});
`;

export const openapiGeneratedHooksTs = `import { deriveHooks } from "@simplix-react/react";
import { {{domainName}}Api } from "./contract.js";

export const {{domainName}}Hooks = deriveHooks({{domainName}}Api);
`;

export const openapiGeneratedMockHandlersTs = `import type { HttpHandler } from "msw";
import { deriveMockHandlers } from "@simplix-react/mock";
import { {{domainName}}Api } from "../../generated/contract.js";

export const handlers: HttpHandler[] = deriveMockHandlers({{domainName}}Api.config);
`;

export const openapiGeneratedMockMigrationsTs = `export const migrations = [
{{#each entities}}
  \`CREATE TABLE IF NOT EXISTS {{../domainName}}_{{pluralName}} (
{{#each fields}}
    {{snakeName}} {{sqlType}}{{#if required}} NOT NULL{{/if}}{{#if (eq name "id")}} PRIMARY KEY{{/if}}{{#unless @last}},{{/unless}}
{{/each}}
  )\`,
{{/each}}
];
`;

export const openapiMockSeedTs = `import type { PGlite } from "@electric-sql/pglite";

export async function seed(_db: PGlite): Promise<void> {
  // Add seed data for {{domainName}} entities here
}
`;
