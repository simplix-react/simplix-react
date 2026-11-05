import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { resolveMswWorkerPath } from "../vite-plugin.js";

const made: string[] = [];

/** The worker file of the msw this package installs. */
const FRAMEWORK_WORKER = createRequire(import.meta.url).resolve("msw/mockServiceWorker.js");

/** A project root that installs its own msw, holding a worker file of its own. */
function appWithMsw(): string {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "msw-root-")));
  made.push(root);
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "app", private: true }));
  const msw = join(root, "node_modules", "msw");
  mkdirSync(msw, { recursive: true });
  writeFileSync(
    join(msw, "package.json"),
    JSON.stringify({ name: "msw", version: "0.0.0-app", exports: { "./mockServiceWorker.js": "./mockServiceWorker.js" } }),
  );
  writeFileSync(join(msw, "mockServiceWorker.js"), "// the app's worker");
  return root;
}

/** A project root with no msw of its own. */
function appWithoutMsw(): string {
  const root = mkdtempSync(join(tmpdir(), "msw-bare-"));
  made.push(root);
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "bare", private: true }));
  return root;
}

afterEach(() => {
  for (const root of made.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("resolveMswWorkerPath", () => {
  it("serves the worker of the msw the app installs, not the framework's", () => {
    const root = appWithMsw();
    expect(resolveMswWorkerPath(root)).toBe(join(root, "node_modules", "msw", "mockServiceWorker.js"));
  });

  it("falls back to the framework's msw for an app that installs none", () => {
    expect(resolveMswWorkerPath(appWithoutMsw())).toBe(FRAMEWORK_WORKER);
  });

  it("uses the framework's msw before the config names a root", () => {
    expect(resolveMswWorkerPath(undefined)).toBe(FRAMEWORK_WORKER);
  });
});
