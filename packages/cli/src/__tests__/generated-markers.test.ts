import { mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { withConflictMarkers, writeStampedGenerated } from "../utils/generated-merge.js";
import { stampFingerprint } from "../utils/project-templates.js";

describe("a file that already holds conflict markers", () => {
  let root: string;
  let cwd: string;

  beforeEach(async () => {
    cwd = process.cwd();
    root = await realpath(await mkdtemp(join(tmpdir(), "simplix-markers-")));
    await writeFile(join(root, "simplix.config.ts"), "export default {};\n");
    process.chdir(root);
  });

  afterEach(async () => {
    process.chdir(cwd);
    await rm(root, { recursive: true, force: true });
  });

  const render = (body: string) => `/**\n * @simplix-generated page/x\n */\nexport const a = 1;\nexport const body = "${body}";\nexport const z = 1;\n`;

  it("is merged once, never over its own markers", async () => {
    const path = join(root, "src/x.tsx");
    const stamp = (text: string) => stampFingerprint(text, "scaffold x --module m");
    await writeStampedGenerated(path, stamp(render("v1")));
    await writeFile(path, (await readFile(path, "utf-8")).replace('"v1"', '"mine"'));

    const first = await withConflictMarkers(() => writeStampedGenerated(path, stamp(render("v2"))));
    expect(first.outcome).toBe("conflict");
    const once = await readFile(path, "utf-8");
    expect(once.match(/^<<<<<<< edited$/gm)).toHaveLength(1);

    // A second render of the same file, as a second origin of one run makes, leaves it as the first wrote it.
    const second = await withConflictMarkers(() => writeStampedGenerated(path, stamp(render("v3"))));
    expect(second.outcome).toBe("conflict");
    expect(await readFile(path, "utf-8")).toBe(once);
    expect((await readFile(path, "utf-8")).match(/^<<<<<<< edited$/gm)).toHaveLength(1);
  });
});
