import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validateFsdRules } from "../validators/fsd-rules.js";
import type { ValidationResult } from "../commands/validate.js";

let tempDir: string;

function makeResult(): ValidationResult {
  return { path: "test", errors: [], warnings: [], passes: [] };
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "fsd-rules-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("validateFsdRules", () => {
  it("does nothing when src does not exist", async () => {
    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });

  it("passes when manifest.ts exists (module mode)", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });
    await writeFile(join(srcDir, "manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.passes).toContain("Manifest exists");
  });

  it("reports error when manifest.ts is missing (module mode)", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors).toContain("Missing manifest.ts");
  });

  it("skips manifest check when type=app", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });

    const result = makeResult();
    await validateFsdRules(tempDir, result, { type: "app" });
    expect(result.errors.filter((e) => e.includes("manifest"))).toHaveLength(0);
  });

  it("reports features/ importing from widgets/", async () => {
    const featuresDir = join(tempDir, "src/features");
    await mkdir(featuresDir, { recursive: true });
    await writeFile(join(featuresDir, "foo.ts"), 'import { Bar } from "../widgets/bar";\n');
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors.some((e) => e.includes("features/ imports from widgets/"))).toBe(true);
  });

  it("passes when features/ has no widgets imports", async () => {
    const featuresDir = join(tempDir, "src/features");
    await mkdir(featuresDir, { recursive: true });
    await writeFile(join(featuresDir, "foo.ts"), 'import { x } from "./utils";\n');
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.passes).toContain("FSD: features/ has no widgets/ imports");
  });

  it("reports shared/ importing from features/", async () => {
    const sharedDir = join(tempDir, "src/shared");
    await mkdir(sharedDir, { recursive: true });
    await writeFile(join(sharedDir, "util.ts"), 'import { x } from "../features/foo";\n');
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors.some((e) => e.includes("shared/ imports from"))).toBe(true);
  });

  it("reports shared/ importing from widgets/", async () => {
    const sharedDir = join(tempDir, "src/shared");
    await mkdir(sharedDir, { recursive: true });
    await writeFile(join(sharedDir, "util.ts"), 'import { y } from "../widgets/bar";\n');
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors.some((e) => e.includes("shared/ imports from"))).toBe(true);
  });

  it("passes when shared/ has no features/widgets imports", async () => {
    const sharedDir = join(tempDir, "src/shared");
    await mkdir(sharedDir, { recursive: true });
    await writeFile(join(sharedDir, "util.ts"), 'import { x } from "./helpers";\n');
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.passes).toContain("FSD: shared/ has no features/widgets imports");
  });

  it("detects import violations via require syntax", async () => {
    const featuresDir = join(tempDir, "src/features");
    await mkdir(featuresDir, { recursive: true });
    await writeFile(join(featuresDir, "foo.ts"), 'const x = require("../widgets/bar");\n');
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors.some((e) => e.includes("features/ imports from widgets/"))).toBe(true);
  });

  it("handles multiple files with violations", async () => {
    const featuresDir = join(tempDir, "src/features");
    await mkdir(featuresDir, { recursive: true });
    await writeFile(join(featuresDir, "foo.ts"), 'import { A } from "../widgets/a";\n');
    await writeFile(join(featuresDir, "bar.ts"), 'import { B } from "../widgets/b";\n');
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors.filter((e) => e.includes("features/ imports from widgets/")).length).toBe(2);
  });

  it("ignores lines without import/require", async () => {
    const featuresDir = join(tempDir, "src/features");
    await mkdir(featuresDir, { recursive: true });
    await writeFile(join(featuresDir, "foo.ts"), [
      "// This is a comment about widgets/",
      "const widgets = 'just a string';",
      'import { x } from "./safe";\n',
    ].join("\n"));
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.passes).toContain("FSD: features/ has no widgets/ imports");
  });
});
