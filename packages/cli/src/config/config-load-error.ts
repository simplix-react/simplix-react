/**
 * Thrown when a config file the project wrote, `simplix.config.ts` or a package's
 * `crud.config.ts`, exists but cannot be loaded: a syntax error, an import that does not resolve,
 * or an expression that throws while the file evaluates.
 *
 * <p>Running on the default config instead would make every command generate against settings the
 * project did not choose and report success, so a config that is there and broken stops the run.
 * The message names the file and carries the original error; `cause` is that
 * error itself.
 */
export class ConfigLoadError extends Error {
  /** Path of the config file that failed to load. */
  readonly path: string;

  constructor(path: string, cause: unknown) {
    super(`Cannot load ${path}: ${describeCause(cause)}`, { cause });
    this.name = "ConfigLoadError";
    this.path = path;
  }
}

/** The original error as one reader-facing line: its message, led by its type unless that is the plain `Error`. */
function describeCause(cause: unknown): string {
  if (!(cause instanceof Error)) return String(cause);
  return cause.name === "Error" ? cause.message : `${cause.name}: ${cause.message}`;
}
