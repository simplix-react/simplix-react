import { spawn } from "node:child_process";
import { relative, resolve } from "node:path";

import { loadConfig } from "../config/config-loader.js";
import type { GeneratedAfterStep } from "../config/types.js";
import { log } from "./logger.js";

/** What running one follow-up command came to. */
export interface AfterOutcome {
  readonly step: GeneratedAfterStep;
  /** The exit code, or `null` when the command never started or was ended by a signal. */
  readonly exitCode: number | null;
  /** The signal that ended the command, when one did. */
  readonly signal?: string;
  /** Why the command never started. */
  readonly error?: string;
}

/** Runs one command through the shell in `cwd` with its output on this process's streams. */
function runStep(cwd: string, step: GeneratedAfterStep): Promise<AfterOutcome> {
  return new Promise((done) => {
    const child = spawn(step.command, { cwd, shell: true, stdio: "inherit" });
    child.once("error", (err) => done({ step, exitCode: null, error: err.message }));
    child.once("close", (exitCode, signal) => done({ step, exitCode, ...(signal ? { signal } : {}) }));
  });
}

/**
 * Runs the follow-up commands in order and stops at the first that does not exit with 0.
 *
 * @param rootDir the project root the steps' `cwd` is relative to
 * @param steps the commands from `generated.after`
 * @returns one outcome per command that was started; commands after a failure are not in the list
 */
export async function runAfterSteps(rootDir: string, steps: readonly GeneratedAfterStep[]): Promise<AfterOutcome[]> {
  const outcomes: AfterOutcome[] = [];
  for (const step of steps) {
    const cwd = resolve(rootDir, step.cwd ?? ".");
    log.info(`after: ${step.command} (in ${relative(rootDir, cwd) || "."})`);
    const outcome = await runStep(cwd, step);
    outcomes.push(outcome);
    if (outcome.exitCode === 0) {
      log.success(`after: ${step.command} exited 0`);
      continue;
    }
    const why = outcome.error ?? (outcome.signal ? `was ended by ${outcome.signal}` : `exited ${outcome.exitCode}`);
    const skipped = steps.length - outcomes.length;
    log.error(`after: ${step.command} ${why}${skipped > 0 ? `; ${skipped} later step(s) skipped` : ""}`);
    break;
  }
  return outcomes;
}

/**
 * Runs the project's `generated.after` commands once a generator has written its files and fails
 * the run (`process.exitCode = 1`) when one does not exit with 0.
 *
 * <p>Called by the command layer only: the generated-state report runs the generators in capture
 * mode, and a regeneration runs them once per origin, so neither may trigger it.
 *
 * @param rootDir the project root
 * @returns the outcomes, empty when the project configures no step
 */
export async function runAfterGenerate(rootDir: string): Promise<AfterOutcome[]> {
  const steps = (await loadConfig(rootDir)).generated?.after ?? [];
  if (steps.length === 0) return [];
  const outcomes = await runAfterSteps(rootDir, steps);
  if (outcomes.length < steps.length || outcomes.some((one) => one.exitCode !== 0)) process.exitCode = 1;
  return outcomes;
}
