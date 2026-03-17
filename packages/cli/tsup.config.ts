import { defineConfig } from "tsup";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const packagesDir = join(__dirname, "..");

// ---------------------------------------------------------------------------
// 1. Read framework package versions
// ---------------------------------------------------------------------------

interface PkgData {
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

function readPkg(pkgName: string): PkgData {
  const raw = JSON.parse(
    readFileSync(join(packagesDir, pkgName, "package.json"), "utf-8"),
  );
  return {
    version: raw.version ?? "0.0.0",
    dependencies: raw.dependencies ?? {},
    devDependencies: raw.devDependencies ?? {},
  };
}

const FRAMEWORK_PKGS = ["cli", "contract", "react", "form", "mock", "i18n", "testing", "ui", "api"];
const fwVersions: Record<string, string> = {};

for (const pkg of FRAMEWORK_PKGS) {
  fwVersions[pkg] = readPkg(pkg).version;
}
fwVersions["meta"] = readPkg("simplix-react").version;

// ---------------------------------------------------------------------------
// 2. Build unified dependency version map
//    Source of truth: framework package.json > consumer defaults
// ---------------------------------------------------------------------------

const depVersions: Record<string, string> = {};

// Consumer-only deps (not in any framework package.json)
const CONSUMER_DEPS: Record<string, string> = {
  "@tanstack/query-core": "^5.90.20",
  "@tanstack/react-form": "^1.28.5",
  "@tanstack/react-query": "^5.90.21",
  "@tanstack/react-router": "^1.167.4",
  "@tanstack/router-plugin": "^1.166.13",
  "@types/react": "^19.2.14",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^6.0.1",
  "@tailwindcss/vite": "^4.2.1",
  "lucide-react": "^0.577.0",
  "oxlint": "^1.56.0",
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "tailwindcss": "^4.2.1",
  "turbo": "^2.8.17",
  "vite": "^8.0.0",
  "vitest": "^4.1.0",
};

// Step 1: seed with framework dependencies + devDependencies (build tools)
for (const pkg of FRAMEWORK_PKGS) {
  const data = readPkg(pkg);
  Object.assign(depVersions, data.dependencies, data.devDependencies);
}

// Step 2: consumer deps override (specific versions for generated consumer projects)
Object.assign(depVersions, CONSUMER_DEPS);

// Step 3: remove internal packages and workspace refs
for (const key of Object.keys(depVersions)) {
  if (
    key.startsWith("@simplix-react/") ||
    depVersions[key].includes("workspace:")
  ) {
    delete depVersions[key];
  }
}

// ---------------------------------------------------------------------------
// 3. Build tsup define map
// ---------------------------------------------------------------------------

const versionDefines = {
  __FW_VERSIONS__: JSON.stringify(fwVersions),
  __DEP_VERSIONS__: JSON.stringify(depVersions),
};

const sharedConfig: import("tsup").Options = {
  format: ["esm"],
  target: "node20",
  splitting: false,
  treeshake: true,
  define: versionDefines,
  loader: { ".hbs": "text" },
  external: [
    /^commander/,
    /^handlebars/,
    /^jiti/,
    /^ora/,
    /^prompts/,
    /^picocolors/,
    /^yaml/,
    /^@simplix-react-ext\//,
  ],
};

export default defineConfig([
  {
    ...sharedConfig,
    entry: { bin: "src/bin.ts" },
    dts: false,
    clean: true,
    banner: { js: "#!/usr/bin/env node" },
  },
  {
    ...sharedConfig,
    entry: { index: "src/index.ts" },
    dts: true,
  },
]);
