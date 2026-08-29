import { dirname, join } from "node:path";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { pathExists } from "../utils/fs.js";
import type { CrudEntityConfig, CrudMap } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_ENTRY = join(__dirname, "index.js");

/**
 * Search all packages for a crud.config.ts that defines the given entity,
 * and return its CrudEntityConfig if found.
 *
 * The key is matched exactly first and then without regard to case. A map written before the
 * generator settled on one spelling records `ApiClient` where every other source says `apiClient`,
 * and an exact-only lookup answers `null` for it — which is not "this entity has no roles" but
 * "this entity's roles are in a file I declined to read", and the scaffolded form comes out with
 * its hooks stubbed. Two keys of one map differing only in case would name one entity twice, so
 * there is nothing for the loose match to pick wrongly between.
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
    const configPath = join(packagesDir, entry.name, "crud.config.ts");
    if (!(await pathExists(configPath))) continue;

    const map = await loadCrudMap(configPath);
    if (!map) continue;
    if (entityName in map) return map[entityName];

    const folded = entityName.toLowerCase();
    const key = Object.keys(map).find((one) => one.toLowerCase() === folded);
    if (key !== undefined) return map[key];
  }
  return null;
}

async function loadCrudMap(configPath: string): Promise<CrudMap | null> {
  try {
    const { createJiti } = await import("jiti");
    const jiti = createJiti(dirname(configPath), {
      interopDefault: true,
      alias: { "@simplix-react/cli": CLI_ENTRY },
    });
    const loaded = await jiti.import(configPath);
    const map =
      typeof loaded === "object" && loaded !== null && "default" in loaded
        ? (loaded as { default: CrudMap }).default
        : (loaded as CrudMap);
    return map;
  } catch {
    return null;
  }
}
