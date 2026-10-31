import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../utils/logger.js", () => ({
  log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), success: vi.fn(), step: vi.fn() },
}));

import { overlayServerTranslations } from "../commands/openapi.js";
import { log } from "../utils/logger.js";

describe("server translations that do not arrive", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "simplix-i18n-"));
    vi.mocked(log.warn).mockClear();
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("says the locale files hold the base locale's words, rather than returning in silence", async () => {
    await overlayServerTranslations(dir, [], ["en", "ko"], "http://localhost:8080", async () => undefined);
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining("No server translations from http://localhost:8080"));
    expect(log.info).not.toHaveBeenCalledWith("Applied server i18n translations.");
  });
});
