import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ensureScreenDescriptionKey, readsScreenDescription } from "../commands/scaffold-crud.js";

describe("the screen description key", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "simplix-desc-"));
    await mkdir(join(dir, "src/locales/widgets"), { recursive: true });
    await writeFile(join(dir, "src/locales/widgets/en.json"), JSON.stringify({ plan: { x: "y" } }));
    await writeFile(join(dir, "src/locales/widgets/ko.json"), JSON.stringify({ screen: { plan: { description: "요금제" } } }));
  });
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it("is read only where a page reads it", () => {
    expect(readsScreenDescription('t("screen.plan.description")', "plan")).toBe(true);
    expect(readsScreenDescription('t("plan.plansDescription")', "plan")).toBe(false);
  });

  it("is laid down empty where missing and never overwrites a stated one", async () => {
    await ensureScreenDescriptionKey(dir, "plan", ["en", "ko"]);
    const en = JSON.parse(await readFile(join(dir, "src/locales/widgets/en.json"), "utf-8"));
    const ko = JSON.parse(await readFile(join(dir, "src/locales/widgets/ko.json"), "utf-8"));
    expect(en).toEqual({ plan: { x: "y" }, screen: { plan: { description: "" } } });
    expect(ko.screen.plan.description).toBe("요금제");
  });
});
