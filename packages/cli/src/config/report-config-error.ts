import { ProjectRootError } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { ConfigLoadError } from "./config-load-error.js";
import { OutputDirError } from "./output-dirs.js";

/**
 * Prints a problem in the project's config and fails the run with a non-zero exit code.
 *
 * <p>A config file that cannot be loaded ({@link ConfigLoadError}), a configured output directory
 * that is not there ({@link OutputDirError}) and a run that finds no project root
 * ({@link ProjectRootError}) are the caller's to fix, so each is printed as its message without a
 * stack.
 *
 * @param err whatever a command raised
 * @returns true when `err` was such a problem and has been reported, false when it is anything else
 */
export function failOnConfigError(err: unknown): boolean {
  if (!(err instanceof ConfigLoadError || err instanceof OutputDirError || err instanceof ProjectRootError)) return false;
  log.error(err.message);
  process.exitCode = 1;
  return true;
}

/**
 * Wraps a command action so a problem in the project's config prints its message and fails the run
 * with a non-zero exit code instead of surfacing as an unhandled rejection with a stack. Any other
 * error passes through untouched.
 */
export function reportConfigError<A extends unknown[]>(run: (...args: A) => Promise<void>): (...args: A) => Promise<void> {
  return async (...args: A) => {
    try {
      await run(...args);
    } catch (err) {
      if (!failOnConfigError(err)) throw err;
    }
  };
}
