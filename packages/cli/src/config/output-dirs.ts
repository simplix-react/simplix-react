import { stat } from "node:fs/promises";
import { resolve } from "node:path";

import type { SimplixConfig } from "./types.js";

/**
 * A config option naming a directory the generators write into, track generated files under, or
 * run a follow-up command in.
 *
 * <p>Writing into a directory that is not there creates it, and tracking a directory that is not
 * there finds nothing, so a mistyped path reads as a project with no generated files there. Every
 * option of this kind is listed here once, and {@link assertOutputDirs} refuses the ones that do
 * not resolve to an existing directory.
 */
interface OutputDirOption {
  /** What a missing directory costs, ending the sentence "<option> ... resolves to <path>, which does not exist." */
  readonly consequence: string;
  /** The configured values with the option as the config spells each one, e.g. `templates.storiesDir`; relative to the project root unless absolute. */
  readonly read: (config: SimplixConfig) => readonly { readonly option: string; readonly configured: string | undefined }[];
}

/** Every config option that names an output directory. */
export const OUTPUT_DIR_OPTIONS: readonly OutputDirOption[] = [
  {
    consequence: "Generated files there would go unwritten or untracked: create the directory or correct the option.",
    read: (config) => [{ option: "templates.storiesDir", configured: config.templates?.storiesDir }],
  },
  {
    consequence: "The command would fail after every generation: create the directory or correct the option.",
    read: (config) => (config.generated?.after ?? []).map((step, at) => ({ option: `generated.after[${at}].cwd`, configured: step.cwd })),
  },
];

/** One configured output directory that cannot be used. */
export interface OutputDirProblem {
  /** The option as the config spells it. */
  readonly option: string;
  /** The value as configured. */
  readonly configured: string;
  /** The configured value resolved against the project root. */
  readonly path: string;
  readonly reason: "missing" | "not-a-directory";
  /** What the missing directory costs. */
  readonly consequence: string;
}

/** Thrown when a configured output directory is missing; the message names each option and its resolved path. */
export class OutputDirError extends Error {
  readonly problems: readonly OutputDirProblem[];

  constructor(problems: readonly OutputDirProblem[]) {
    super(problems.map(describe).join("\n"));
    this.name = "OutputDirError";
    this.problems = problems;
  }
}

function describe(problem: OutputDirProblem): string {
  const what = problem.reason === "missing" ? "does not exist" : "is not a directory";
  return (
    `simplix.config.ts: ${problem.option} "${problem.configured}" resolves to ${problem.path}, which ${what}. ${problem.consequence}`
  );
}

/**
 * Resolves every configured output directory and reports the ones that are not an existing
 * directory. An option left out of the config is not checked.
 *
 * @param rootDir the project root the configured paths are relative to
 * @param config the loaded project config
 */
export async function findOutputDirProblems(rootDir: string, config: SimplixConfig): Promise<OutputDirProblem[]> {
  const problems: OutputDirProblem[] = [];
  for (const { consequence, read } of OUTPUT_DIR_OPTIONS) {
    for (const { option, configured } of read(config)) {
      if (!configured) continue;
      const path = resolve(rootDir, configured);
      let isDirectory: boolean;
      try {
        isDirectory = (await stat(path)).isDirectory();
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        // ENOTDIR: a segment of the path is a file, so nothing can be below it.
        if (code !== "ENOENT" && code !== "ENOTDIR") throw err;
        problems.push({ option, configured, path, reason: "missing", consequence });
        continue;
      }
      if (!isDirectory) problems.push({ option, configured, path, reason: "not-a-directory", consequence });
    }
  }
  return problems;
}

/**
 * Refuses a config whose output directory does not exist.
 *
 * @param rootDir the project root the configured paths are relative to
 * @param config the loaded project config
 * @throws {OutputDirError} naming each unusable option and the path it resolved to
 */
export async function assertOutputDirs(rootDir: string, config: SimplixConfig): Promise<void> {
  const problems = await findOutputDirProblems(rootDir, config);
  if (problems.length > 0) throw new OutputDirError(problems);
}
