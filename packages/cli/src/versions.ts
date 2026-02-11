// Framework and dependency versions — injected at build time by tsup.
// See tsup.config.ts for the version collection logic.

declare const __FW_VERSIONS__: Record<string, string>;
declare const __DEP_VERSIONS__: Record<string, string>;

// ---------------------------------------------------------------------------
// Framework package versions
// ---------------------------------------------------------------------------

type FrameworkPkg =
  | "@simplix-react/cli"
  | "@simplix-react/contract"
  | "@simplix-react/react"
  | "@simplix-react/mock"
  | "@simplix-react/i18n"
  | "@simplix-react/testing";

const FW_KEY_MAP: Record<FrameworkPkg, string> = {
  "@simplix-react/cli": "cli",
  "@simplix-react/contract": "contract",
  "@simplix-react/react": "react",
  "@simplix-react/mock": "mock",
  "@simplix-react/i18n": "i18n",
  "@simplix-react/testing": "testing",
};

export function frameworkVersion(pkg: FrameworkPkg): string {
  return __FW_VERSIONS__[FW_KEY_MAP[pkg]];
}

export function frameworkRange(pkg: FrameworkPkg): string {
  return `^${frameworkVersion(pkg)}`;
}

// ---------------------------------------------------------------------------
// Dependency versions
// ---------------------------------------------------------------------------

export function depVersion(pkg: string): string {
  const v = __DEP_VERSIONS__[pkg];
  if (!v) throw new Error(`Unknown dependency: ${pkg}. Add it to tsup.config.ts CONSUMER_DEPS.`);
  return v;
}

// ---------------------------------------------------------------------------
// Template context helpers
// ---------------------------------------------------------------------------

/** Convert "@tanstack/react-query" → "tanstackReactQuery" */
function pkgNameToKey(name: string): string {
  return name
    .replace(/^@/, "")
    .split(/[/-]/)
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

/**
 * Adds framework version and dependency version Handlebars variables to a template context.
 *
 * Framework versions (caret ranges):
 *   {{fw.cli}}, {{fw.contract}}, {{fw.react}}, {{fw.mock}}, {{fw.i18n}}
 *
 * Dependency versions (as-is from package.json):
 *   {{deps.zod}}, {{deps.typescript}}, {{deps.tanstackReactQuery}}, etc.
 */
export function withVersions<T extends Record<string, unknown>>(ctx: T) {
  const fw: Record<string, string> = {};
  for (const [key, version] of Object.entries(__FW_VERSIONS__)) {
    fw[key] = `^${version}`;
  }

  const deps: Record<string, string> = {};
  for (const [name, version] of Object.entries(__DEP_VERSIONS__)) {
    deps[pkgNameToKey(name)] = version;
  }

  return { ...ctx, fw, deps };
}
