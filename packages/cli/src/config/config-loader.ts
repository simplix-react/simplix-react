import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathExists } from "../utils/fs.js";
import { ConfigLoadError } from "./config-load-error.js";
import type { SimplixConfig } from "./types.js";

const CONFIG_FILENAME = "simplix.config.ts";
const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_ENTRY = join(__dirname, "index.js");

/**
 * Load simplix.config.ts from project root using jiti.
 *
 * <p>A project with no `simplix.config.ts` gets the default config. That is the only fallback: a
 * config file that exists is the project's choice of settings, so a failure to load it is raised
 * and never replaced by the defaults.
 *
 * @param rootDir the project root that holds `simplix.config.ts`
 * @throws {ConfigLoadError} naming the file and the original error, when the file exists but cannot be loaded
 */
export async function loadConfig(rootDir: string): Promise<SimplixConfig> {
  const configPath = join(rootDir, CONFIG_FILENAME);

  if (!(await pathExists(configPath))) {
    return getDefaultConfig();
  }

  const { createJiti } = await import("jiti");
  const jiti = createJiti(rootDir, {
    interopDefault: true,
    alias: {
      "@simplix-react/cli": CLI_ENTRY,
    },
  });

  let loaded: unknown;
  try {
    loaded = await jiti.import(configPath);
  } catch (cause) {
    throw new ConfigLoadError(configPath, cause);
  }

  const config =
    typeof loaded === "object" && loaded !== null && "default" in loaded
      ? (loaded as { default: SimplixConfig }).default
      : (loaded as SimplixConfig);

  return { ...getDefaultConfig(), ...config };
}

function getDefaultConfig(): SimplixConfig {
  return {
    api: {
      baseUrl: "/api",
    },
    i18n: {
      locales: ["en", "ko", "ja"],
      defaultLocale: "en",
    },
    http: {
      environments: {
        development: { baseUrl: "http://localhost:3000" },
      },
    },
  };
}
