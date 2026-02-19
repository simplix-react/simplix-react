import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathExists } from "../utils/fs.js";
import type { SimplixConfig } from "./types.js";

const CONFIG_FILENAME = "simplix.config.ts";
const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_ENTRY = join(__dirname, "index.js");

/**
 * Load simplix.config.ts from project root using jiti.
 * Returns default config if file not found or if loading fails.
 */
export async function loadConfig(rootDir: string): Promise<SimplixConfig> {
  const configPath = join(rootDir, CONFIG_FILENAME);

  if (!(await pathExists(configPath))) {
    return getDefaultConfig();
  }

  try {
    const { createJiti } = await import("jiti");
    const jiti = createJiti(rootDir, {
      interopDefault: true,
      alias: {
        "@simplix-react/cli": CLI_ENTRY,
      },
    });

    const loaded = await jiti.import(configPath);
    const config =
      typeof loaded === "object" && loaded !== null && "default" in loaded
        ? (loaded as { default: SimplixConfig }).default
        : (loaded as SimplixConfig);

    return { ...getDefaultConfig(), ...config };
  } catch {
    // Config file exists but can't be loaded (e.g., deps not installed yet)
    // Fall back to defaults
    return getDefaultConfig();
  }
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
