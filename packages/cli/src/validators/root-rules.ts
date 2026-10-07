import { join } from "node:path";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import { pathExists } from "../utils/fs.js";
import { depVersion } from "../versions.js";
import type { ValidationResult } from "../commands/validate.js";

/**
 * Root Rules — the source-first dev setup:
 * - turbo.json: dev:app and lint build nothing first, typecheck chains through ^typecheck,
 *   concurrency is capped
 * - Root scripts: dev runs the apps only, build scripts typecheck alongside the build
 * - The pnpm catalog carries TypeScript 7
 *
 * Every fix edits the file as text, one value at a time, so the rest of its formatting survives
 * and a second run finds nothing to fix.
 */
export async function validateRootRules(
  rootDir: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): Promise<void> {
  await validateTurboJson(rootDir, result, options);
  await validateRootScripts(rootDir, result, options);
  await validateCatalogTypescript(rootDir, result, options);
}

const TURBO_CONCURRENCY = "4";

interface TurboTask {
  dependsOn?: string[];
}

async function validateTurboJson(
  rootDir: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): Promise<void> {
  const turboPath = join(rootDir, "turbo.json");
  if (!(await pathExists(turboPath))) return;

  const text = await readFile(turboPath, "utf-8");
  const turbo = JSON.parse(text) as { concurrency?: string; tasks?: Record<string, TurboTask> };
  const tasks = turbo.tasks ?? {};

  const wanted: [string, string[]][] = [];
  for (const task of ["dev:app", "lint"]) {
    if (tasks[task]?.dependsOn?.includes("^build")) wanted.push([task, []]);
  }
  const typecheck = tasks["typecheck"]?.dependsOn;
  if (typecheck && !(typecheck.length === 1 && typecheck[0] === "^typecheck")) {
    wanted.push(["typecheck", ["^typecheck"]]);
  }
  const addConcurrency = turbo.concurrency === undefined;

  if (wanted.length === 0 && !addConcurrency) {
    result.passes.push("turbo.json runs dev:app and lint without builds");
    return;
  }

  const issues = [
    ...wanted.map(([task, deps]) => `"${task}" dependsOn ${JSON.stringify(deps)}`),
    ...(addConcurrency ? [`"concurrency": "${TURBO_CONCURRENCY}"`] : []),
  ];
  if (!options?.fix) {
    result.warnings.push(`turbo.json needs ${issues.join(", ")}`);
    return;
  }

  let fixed = text;
  for (const [task, deps] of wanted) {
    const pattern = new RegExp(`("${task}"\\s*:\\s*\\{[^{}]*?"dependsOn"\\s*:\\s*)\\[[^\\]]*\\]`);
    fixed = fixed.replace(pattern, (_, head: string) => `${head}${JSON.stringify(deps).replaceAll(",", ", ")}`);
  }
  if (addConcurrency) {
    const schemaLine = /^([ \t]*)"\$schema"\s*:\s*"[^"]*",[ \t]*\n/m.exec(fixed);
    const at = schemaLine ? schemaLine.index + schemaLine[0].length : fixed.indexOf("{") + 2;
    const indent = schemaLine ? schemaLine[1] : "  ";
    fixed = `${fixed.slice(0, at)}${indent}"concurrency": "${TURBO_CONCURRENCY}",\n${fixed.slice(at)}`;
  }
  await writeFile(turboPath, fixed, "utf-8");
  result.passes.push(`Auto-fixed: turbo.json ${issues.join(", ")}`);
}

/** `turbo run clean && turbo run build[ options] && turbo watch dev:app[ rest]` */
const BUILD_THEN_WATCH = /^turbo run clean && turbo run build(?: [^&]*)? && turbo watch dev:app(.*)$/;
/** `turbo watch dev:app[ rest]` */
const WATCH_DEV_APP = /^turbo watch dev:app(.*)$/;

async function validateRootScripts(
  rootDir: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): Promise<void> {
  const pkgPath = join(rootDir, "package.json");
  if (!(await pathExists(pkgPath))) return;

  const text = await readFile(pkgPath, "utf-8");
  const scripts = (JSON.parse(text) as { scripts?: Record<string, string> }).scripts ?? {};
  const expoApps = await discoverExpoApps(rootDir);

  const rewrites: [string, string, string][] = [];
  for (const [name, command] of Object.entries(scripts)) {
    const rewritten = rewriteScript(name, command);
    if (rewritten !== command) {
      rewrites.push([name, command, rewritten]);
      continue;
    }

    if (command.includes("turbo watch")) {
      result.warnings.push(`Script "${name}" uses turbo watch; run the apps with turbo run dev:app instead`);
      continue;
    }

    const app = startedExpoApp(command, expoApps);
    if (app && !command.includes("turbo run")) {
      result.warnings.push(
        `Script "${name}" runs Expo app ${app}, which reads workspace packages from dist; ` +
          `build them first (turbo run build --filter=${app}^...)`,
      );
    }
  }

  if (rewrites.length === 0) return;

  const names = rewrites.map(([name]) => `"${name}"`).join(", ");
  if (!options?.fix) {
    result.warnings.push(`Scripts build packages for dev or skip typecheck: ${names}`);
    return;
  }

  let fixed = text;
  for (const [name, command, rewritten] of rewrites) {
    const pattern = new RegExp(`(${escapeRegExp(JSON.stringify(name))}\\s*:\\s*)${escapeRegExp(JSON.stringify(command))}`);
    fixed = fixed.replace(pattern, (_, head: string) => `${head}${JSON.stringify(rewritten)}`);
  }
  await writeFile(pkgPath, fixed, "utf-8");
  result.passes.push(`Auto-fixed: scripts ${names}`);
}

function rewriteScript(name: string, command: string): string {
  const buildThenWatch = BUILD_THEN_WATCH.exec(command);
  if (buildThenWatch) return `turbo run dev:app${buildThenWatch[1]}`;

  const watch = WATCH_DEV_APP.exec(command);
  if (watch) return `turbo run dev:app${watch[1]}`;

  if (name.startsWith("build") && command.includes("turbo run build") && !command.includes("typecheck")) {
    // The filter takes the app's dependencies with it, since typecheck now reads them from source.
    return command
      .replace("turbo run build", "turbo run typecheck build")
      .replace(/(--filter[= ])(\S+)/g, (whole, flag: string, target: string) =>
        target.includes("...") ? whole : `${flag}${target}...`,
      );
  }
  return command;
}

/** The Expo app a root script starts or exports through `pnpm --filter`, if any. */
function startedExpoApp(command: string, expoApps: Map<string, Record<string, string>>): string | undefined {
  for (const match of command.matchAll(/pnpm\s+(?:--filter[= ]|-F\s*)(\S+)\s+(?:run\s+)?([\w:-]+)/g)) {
    const scripts = expoApps.get(match[1]);
    if (scripts?.[match[2]]?.includes("expo ")) return match[1];
  }
  return undefined;
}

async function discoverExpoApps(rootDir: string): Promise<Map<string, Record<string, string>>> {
  const apps = new Map<string, Record<string, string>>();
  const appsDir = join(rootDir, "apps");
  if (!(await pathExists(appsDir))) return apps;

  for (const entry of await readdir(appsDir, { withFileTypes: true })) {
    const pkgPath = join(appsDir, entry.name, "package.json");
    if (!entry.isDirectory() || !(await pathExists(pkgPath))) continue;
    const pkg = JSON.parse(await readFile(pkgPath, "utf-8")) as PackageJson;
    if (dependsOnExpo(pkg) && pkg.name) apps.set(pkg.name, pkg.scripts ?? {});
  }
  return apps;
}

async function validateCatalogTypescript(
  rootDir: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): Promise<void> {
  const workspacePath = join(rootDir, "pnpm-workspace.yaml");
  if (!(await pathExists(workspacePath))) return;

  const text = await readFile(workspacePath, "utf-8");
  const current = (parseYaml(text) as { catalog?: Record<string, unknown> } | null)?.catalog?.["typescript"];
  if (typeof current !== "string" || !(majorOf(current) < 7)) return;

  const target = depVersion("typescript");
  if (!options?.fix) {
    result.warnings.push(`Catalog TypeScript is ${current}; generated projects use ${target}`);
    return;
  }

  // The typescript line inside the top-level catalog block, not one under overrides or catalogs.
  const catalog = /^catalog:[ \t]*\n((?:[ \t]+.*\n?|[ \t]*\n)*)/m.exec(text);
  const line = catalog ? /^([ \t]+["']?typescript["']?[ \t]*:[ \t]*)(\S+)/m.exec(catalog[1]) : null;
  if (!catalog || !line) {
    result.warnings.push(`Catalog TypeScript is ${current}; set it to ${target} by hand`);
    return;
  }
  const start = catalog.index + catalog[0].length - catalog[1].length + line.index;
  const fixed = `${text.slice(0, start)}${line[1]}${target}${text.slice(start + line[0].length)}`;
  await writeFile(workspacePath, fixed, "utf-8");
  result.passes.push(`Auto-fixed: catalog TypeScript ${current} → ${target}; run pnpm install`);
}

/**
 * `baseUrl` is gone in TypeScript 7. `"."` is dropped as it adds nothing; `paths` resolve
 * relative to the tsconfig without it. Any other value, or `paths` that are not relative,
 * are left for a person.
 */
export async function validateTsconfigBaseUrl(
  dir: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): Promise<void> {
  const tsconfigPath = join(dir, "tsconfig.json");
  if (!(await pathExists(tsconfigPath))) return;

  const text = await readFile(tsconfigPath, "utf-8");
  const baseUrl = /"baseUrl"\s*:\s*"([^"]*)"/.exec(text);
  if (!baseUrl) return;

  if (baseUrl[1] !== ".") {
    result.warnings.push(`tsconfig.json sets "baseUrl": "${baseUrl[1]}", which TypeScript 7 removed`);
    return;
  }

  const paths = /"paths"\s*:\s*\{([^}]*)\}/.exec(text);
  const targets = paths ? [...paths[1].matchAll(/\[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/"([^"]*)"/g)].map((t) => t[1])) : [];
  if (targets.some((t) => !t.startsWith("./") && !t.startsWith("../"))) {
    result.warnings.push(
      'tsconfig.json sets "baseUrl", which TypeScript 7 removed; prefix its paths with "./" and drop it',
    );
    return;
  }

  if (!options?.fix) {
    result.warnings.push('tsconfig.json sets "baseUrl", which TypeScript 7 removed');
    return;
  }

  const fixed = text
    .replace(/^[ \t]*"baseUrl"\s*:\s*"\.",[ \t]*\n/m, "")
    .replace(/,([ \t]*\n)[ \t]*"baseUrl"\s*:\s*"\."[ \t]*\n/, "$1");
  await writeFile(tsconfigPath, fixed, "utf-8");
  result.passes.push('Auto-fixed: removed "baseUrl" from tsconfig.json');
}

interface PackageJson {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * An Expo app stays on TypeScript 5: the Expo CLI reads tsconfig paths through the compiler API,
 * which TypeScript 7 does not ship.
 */
export async function validateExpoTypescript(
  appDir: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): Promise<void> {
  const pkgPath = join(appDir, "package.json");
  if (!(await pathExists(pkgPath))) return;

  const text = await readFile(pkgPath, "utf-8");
  const pkg = JSON.parse(text) as PackageJson;
  if (!dependsOnExpo(pkg)) return;

  const current = pkg.devDependencies?.["typescript"] ?? pkg.dependencies?.["typescript"];
  if (current === undefined || (current !== "catalog:" && !(majorOf(current) >= 7))) return;

  const target = depVersion("typescript-expo");
  if (!options?.fix) {
    result.warnings.push(`Expo app uses TypeScript ${current}; the Expo CLI needs ${target}`);
    return;
  }

  const fixed = text.replace(
    new RegExp(`("typescript"\\s*:\\s*)${escapeRegExp(JSON.stringify(current))}`),
    (_, head: string) => `${head}${JSON.stringify(target)}`,
  );
  await writeFile(pkgPath, fixed, "utf-8");
  result.passes.push(`Auto-fixed: Expo app TypeScript ${current} → ${target}`);
}

function dependsOnExpo(pkg: PackageJson): boolean {
  return "expo" in (pkg.dependencies ?? {}) || "expo" in (pkg.devDependencies ?? {});
}

function majorOf(range: string): number {
  return Number(/\d+/.exec(range)?.[0] ?? Number.NaN);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
