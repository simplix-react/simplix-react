// FSD Module template files

export const modulePackageJson = `{
  "name": "{{modulePkgName}}",
  "version": "0.0.1",
  "description": "{{PascalName}} module for {{projectName}}",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./features": {
      "types": "./dist/features/index.d.ts",
      "import": "./dist/features/index.js"
    },
    "./widgets": {
      "types": "./dist/widgets/index.d.ts",
      "import": "./dist/widgets/index.js"
    }{{#if enableI18n}},
    "./locales": {
      "types": "./dist/locales/index.d.ts",
      "import": "./dist/locales/index.js"
    }{{/if}}
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
    {{#if enableI18n}}"@simplix-react/i18n": "{{fw.i18n}}",
    {{/if}}"lucide-react": "{{deps.lucideReact}}"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "@tanstack/react-query": ">=5.0.0"
  },
  "devDependencies": {
    "react": "{{deps.react}}",
    "@tanstack/react-query": "{{deps.tanstackReactQuery}}",
    "tsup": "{{deps.tsup}}",
    "typescript": "{{deps.typescript}}",
    "vitest": "{{deps.vitest}}"
  }
}
`;

export const moduleTsupConfig = `import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: {
    index: "src/index.ts",
    "features/index": "src/features/index.ts",
    "widgets/index": "src/widgets/index.ts",{{#if enableI18n}}
    "locales/index": "src/locales/index.ts",{{/if}}
  },
  format: ["esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: !options.watch,
  treeshake: true,
  external: ["react", "react-dom"],
}));
`;

export const moduleTsconfigJson = `{
  "extends": "../../config/typescript/react.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`;

export const moduleIndexTs = `// {{PascalName}} Module
export { {{camelCase moduleName}}Manifest } from "./manifest.js";

// FSD Layers
export * from "./features/index.js";
export * from "./widgets/index.js";
`;

export const moduleManifestTs = `// {{PascalName}} Module Manifest

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  navigation: {
    label: string;
    icon: string;
    path: string;
    order: number;
  };
  capabilities: string[];
}

export const {{camelCase moduleName}}Manifest: ModuleManifest = {
  id: "{{moduleName}}",
  name: "{{PascalName}}",
  version: "0.0.1",
  navigation: {
    label: "{{PascalName}}",
    icon: "Layout",
    path: "/{{moduleName}}",
    order: 10,
  },
  capabilities: [],
};
`;

export const moduleFeaturesIndexTs = `// Feature layer exports
// Add feature exports here as you create them
export {};
`;

export const moduleWidgetsIndexTs = `// Widget layer exports
// Add widget exports here as you create them
export {};
`;

export const moduleSharedLibGitkeep = "";
export const moduleSharedUiGitkeep = "";
export const moduleSharedConfigGitkeep = "";

export const moduleLocalesIndexTs = `import { buildModuleTranslations } from "@simplix-react/i18n";

export const PACKAGE_NAMESPACE = "{{namespace}}";

export const {{camelCase moduleName}}Translations = buildModuleTranslations({
  namespace: PACKAGE_NAMESPACE,
  locales: ["ko", "en", "ja"],
  components: {
    // CLI will auto-populate as features/widgets are added
    // Example:
    // "widgets/editor": {
    //   ko: () => import("./widgets/editor/ko.json"),
    //   en: () => import("./widgets/editor/en.json"),
    //   ja: () => import("./widgets/editor/ja.json"),
    // },
  },
});
`;

export const moduleLocaleEnJson = JSON.stringify(
  {
    title: "Module",
    description: "Module description",
  },
  null,
  2,
);

export const moduleLocaleKoJson = JSON.stringify(
  {
    title: "모듈",
    description: "모듈 설명",
  },
  null,
  2,
);

export const moduleLocaleJaJson = JSON.stringify(
  {
    title: "モジュール",
    description: "モジュールの説明",
  },
  null,
  2,
);
