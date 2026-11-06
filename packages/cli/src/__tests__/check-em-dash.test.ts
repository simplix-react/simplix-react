import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/** The check lives beside the package's lint, outside `src`, so it is loaded by path. */
const scriptPath = fileURLToPath(new URL("../../scripts/check-em-dash.mjs", import.meta.url));
const { findEmDashes } = (await import(scriptPath)) as {
  findEmDashes: (roots: string[]) => { file: string; line: number; text: string }[];
};

/** The refused character, spelled so this file holds it in no form a reader sees as the dash. */
const EM_DASH = String.fromCodePoint(0x2014);
/** The same character as a script escape: a backslash, then `u2014`. */
const ESCAPED = `${"\\"}u2014`;

describe("the em dash check reads what the CLI writes into a generated project", () => {
  let root: string;

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), "check-em-dash-"));
    const write = async (path: string, text: string) => {
      await mkdir(dirname(join(root, path)), { recursive: true });
      await writeFile(join(root, path), text);
    };
    // Hits: a template's drawn output, a template comment holding the escape, a template's JSX
    // entity, and a generator literal holding the escape.
    await write("templates/list.hbs", `export const List = () => (\n  <span>{{label}} ${EM_DASH} {{count}}</span>\n);\n`);
    await write("templates/detail.hbs", `{{!-- the row ${ESCAPED} its value --}}\nexport const Detail = () => null;\n`);
    await write("templates/empty.hbs", "export const Empty = () => <td>&mdash;</td>;\n");
    await write("generation/emit.ts", `export const HEADER = "/** Generated ${ESCAPED} do not edit. */";\n`);
    // Misses: a clean template, a generator's own comment (never emitted), and the same template
    // text in a fixture template's comment, a test helper and a test, each excluded by one of the
    // check's own rules (the fixture and test directories, the test file name).
    await write("templates/clean.hbs", "{{!-- the row - its value --}}\nexport const Clean = () => <span>{{label}} - {{count}}</span>;\n");
    await write("generation/clean.ts", `// a ${EM_DASH} b\nexport const HEADER = "/** Generated - do not edit. */";\n`);
    await write("__fixtures__/list.hbs", `{{!-- <span>{{label}} ${EM_DASH} {{count}}</span> --}}\n`);
    await write("__tests__/helper.ts", `export const ROW = "<span>{{label}} ${EM_DASH} {{count}}</span>";\n`);
    await write("generation/list.test.ts", `expect(text).not.toContain("<span>{{label}} ${EM_DASH} {{count}}</span>");\n`);
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("finds the character, its escape and its entity in templates and generator literals, and nothing else", () => {
    const hits = findEmDashes([root]).map((hit) => `${relative(root, hit.file)}:${hit.line}`).sort();
    expect(hits).toEqual([
      "generation/emit.ts:1",
      "templates/detail.hbs:1",
      "templates/empty.hbs:1",
      "templates/list.hbs:2",
    ]);
  });

  it("finds nothing in the CLI's own templates and generators", () => {
    const source = fileURLToPath(new URL("..", import.meta.url));
    expect(findEmDashes([source])).toEqual([]);
  });
});
