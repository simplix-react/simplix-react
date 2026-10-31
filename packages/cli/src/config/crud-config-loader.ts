import { dirname, join } from "node:path";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { pathExists } from "../utils/fs.js";
import { ConfigLoadError } from "./config-load-error.js";
import type { CrudEntityConfig, CrudMap } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_ENTRY = join(__dirname, "index.js");

/**
 * Search all packages for a crud.config.ts that defines the given entity,
 * and return its CrudEntityConfig if found.
 *
 * The key is matched exactly first and then without regard to case. A map written before the
 * generator settled on one spelling records `ApiClient` where every other source says `apiClient`,
 * and an exact-only lookup answers `null` for it. That answer does not mean "this entity has no
 * roles"; the roles are in a file the lookup declined to read, and the scaffolded form comes out
 * with its hooks stubbed. Two keys of one map differing only in case would name one entity twice, so
 * there is nothing for the loose match to pick wrongly between.
 *
 * <p>A package with no `crud.config.ts` has nothing to say about any entity. One that exists is
 * the project's statement of which hooks play which role, so a file that cannot be loaded is
 * raised rather than skipped: skipping it scaffolds the entity as if no role were configured.
 *
 * @param rootDir the project root that holds `packages/`
 * @param entityName the entity to look up
 * @returns the entity's roles, or null when no package's `crud.config.ts` names it
 * @throws {ConfigLoadError} naming the file and the original error, when a `crud.config.ts` exists but cannot be loaded
 */
export async function findCrudConfigForEntity(
  rootDir: string,
  entityName: string,
): Promise<CrudEntityConfig | null> {
  const packagesDir = join(rootDir, "packages");
  if (!(await pathExists(packagesDir))) return null;

  const entries = await readdir(packagesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const map = await loadCrudMap(join(packagesDir, entry.name, "crud.config.ts"));
    if (entityName in map) return map[entityName];

    const folded = entityName.toLowerCase();
    const key = Object.keys(map).find((one) => one.toLowerCase() === folded);
    if (key !== undefined) return map[key];
  }
  return null;
}

/**
 * Load one package's `crud.config.ts`.
 *
 * <p>A path with no file is the empty map: the package configures no entity. A file that exists is
 * the package's choice of roles, so a failure to load it is raised and never replaced by the
 * empty map.
 *
 * @param configPath absolute path of the package's `crud.config.ts`
 * @returns the map the file exports by default, or the empty map when there is no file
 * @throws {ConfigLoadError} naming the file and the original error, when the file exists but cannot be loaded
 */
export async function loadCrudMap(configPath: string): Promise<CrudMap> {
  if (!(await pathExists(configPath))) return {};

  const { createJiti } = await import("jiti");
  const jiti = createJiti(dirname(configPath), {
    interopDefault: true,
    alias: { "@simplix-react/cli": CLI_ENTRY },
  });

  let loaded: unknown;
  try {
    loaded = await jiti.import(configPath);
  } catch (cause) {
    throw new ConfigLoadError(configPath, cause);
  }

  const map =
    typeof loaded === "object" && loaded !== null && "default" in loaded
      ? (loaded as { default: CrudMap | null | undefined }).default
      : (loaded as CrudMap | null);
  // A file that loads but exports nothing configures no entity.
  return map ?? {};
}
