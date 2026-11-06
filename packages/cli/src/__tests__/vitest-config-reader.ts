import { readFile } from "node:fs/promises";
import ts from "typescript";

/** The resolve conditions a written `vitest.config.ts` hands each test environment. */
export interface TestConditions {
  /** What a test under `jsdom` or `happy-dom` resolves a package's exports with. */
  client: string[] | undefined;
  /** What a test under `node` resolves a package's exports with. */
  server: string[] | undefined;
}

/**
 * Evaluates a written `vitest.config.ts` and reads the conditions it sets. The config is run
 * rather than matched as text, so a list that is present but never reaches `defineConfig` fails.
 * `defineConfig` returns its argument unchanged, which is all it does for an object.
 */
export async function readTestConditions(path: string): Promise<TestConditions> {
  const source = await readFile(path, "utf-8");
  const imported = 'import { defineConfig } from "vitest/config";';
  if (!source.includes(imported)) throw new Error(`${path} does not import defineConfig from vitest/config`);
  const js = ts.transpileModule(source.replace(imported, "const defineConfig = (config) => config;"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = (await import(`data:text/javascript,${encodeURIComponent(js)}`)) as {
    default: { resolve?: { conditions?: string[] }; ssr?: { resolve?: { conditions?: string[] } } };
  };
  return {
    client: loaded.default.resolve?.conditions,
    server: loaded.default.ssr?.resolve?.conditions,
  };
}
