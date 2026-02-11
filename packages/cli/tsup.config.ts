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

const FRAMEWORK_PKGS = ["cli", "contract", "react", "form", "mock", "i18n", "testing"];
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
  "@tanstack/react-form": "^1.0.0",
  "@tanstack/react-query": "^5.64.0",
  "@tanstack/react-router": "^1.151.0",
  "@tanstack/router-plugin": "^1.151.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  "@typescript-eslint/eslint-plugin": "^8.33.0",
  "@typescript-eslint/parser": "^8.33.0",
  "@vitejs/plugin-react": "^4.5.2",
  "autoprefixer": "^10.4.21",
  "lucide-react": "^0.562.0",
  "postcss": "^8.5.4",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "tailwindcss": "^4.1.10",
  "turbo": "^2.7.5",
  "vite": "^6.3.5",
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
  external: [
    /^commander/,
    /^handlebars/,
    /^jiti/,
    /^ora/,
    /^prompts/,
    /^picocolors/,
    /^yaml/,
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
