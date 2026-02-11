import type { AuthScheme } from "../types.js";
import { AuthError } from "../errors.js";

/**
 * Single-flight refresh deduplication manager.
 *
 * Ensures that concurrent 401 responses trigger only one refresh operation.
 * Subsequent callers await the same in-flight promise, preventing thundering
 * herd problems.
 */
export class RefreshManager {
  private inflight: Promise<void> | null = null;

  constructor(private readonly schemes: AuthScheme[]) {}

  /**
   * Executes a single-flight refresh across all schemes that support it.
   *
   * If a refresh is already in progress, returns the existing promise.
   * @throws {@link AuthError} with code `REFRESH_FAILED` if all refresh attempts fail.
   */
  async refresh(): Promise<void> {
    if (this.inflight) {
      return this.inflight;
    }

    this.inflight = this.doRefresh();

    try {
      await this.inflight;
    } finally {
      this.inflight = null;
    }
  }

  private async doRefresh(): Promise<void> {
    const refreshableSchemes = this.schemes.filter((s) => s.refresh);

    if (refreshableSchemes.length === 0) {
      throw new AuthError(
        "REFRESH_FAILED",
        "No schemes support token refresh",
      );
    }

    const errors: unknown[] = [];

    for (const scheme of refreshableSchemes) {
      try {
        await scheme.refresh!();
        return;
      } catch (error) {
        errors.push(error);
      }
    }

    throw new AuthError("REFRESH_FAILED", "All refresh attempts failed", {
      cause: errors[0],
    });
  }
}
