import pc from "picocolors";

/** True while a generator runs in capture mode, whose lines would describe writes it never made. */
let silent = false;

/**
 * Runs `run` with the CLI's log lines dropped, for a generator observed in capture mode.
 *
 * @param run the invocation whose output is not the caller's to show
 */
export async function withSilentLog<T>(run: () => Promise<T>): Promise<T> {
  const before = silent;
  silent = true;
  try {
    return await run();
  } finally {
    silent = before;
  }
}

function say(line: string): void {
  if (!silent) console.log(line);
}

export const log = {
  info(msg: string) {
    say(pc.cyan("i") + " " + msg);
  },
  success(msg: string) {
    say(pc.green("✔") + " " + msg);
  },
  warn(msg: string) {
    say(pc.yellow("⚠") + " " + msg);
  },
  error(msg: string) {
    // A failure is the caller's to see whatever mode the generator runs in.
    console.log(pc.red("✖") + " " + msg);
  },
  step(msg: string) {
    say(pc.dim("  →") + " " + msg);
  },
};
