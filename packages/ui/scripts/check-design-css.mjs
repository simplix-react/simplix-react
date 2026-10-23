#!/usr/bin/env node
// Compiles design stylesheets with Tailwind in the framework theme, so a class @apply cannot
// resolve is found here rather than as a broken stylesheet in an app.
//   check-design-css [--root <package dir>] [--tailwind-from <dir>] [<design.css>...]
// --tailwind-from names a package that depends on Tailwind (an app), when neither the package
// being checked nor this one does.
// Default: every stylesheet in src/theme/designs of this package. Prints each class Tailwind
// rejects with the slot it came from; exits 1 when there is one.
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const self = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const valueOf = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const root = resolve(valueOf("--root") ?? self);
const tailwindFrom = valueOf("--tailwind-from") ? resolve(valueOf("--tailwind-from")) : undefined;
const optionValues = new Set(["--root", "--tailwind-from"].map(valueOf).filter(Boolean));
const files = args.filter((a) => !a.startsWith("--") && !optionValues.has(a)).map((f) => resolve(root, f));
const targets = files.length ? files : readdirSync(join(self, "src/theme/designs")).filter((f) => f.endsWith(".css") && !f.endsWith("-tokens.css")).map((f) => join(self, "src/theme/designs", f));

const requireFrom = (dir, name) => {
  const req = createRequire(join(dir, "package.json"));
  for (const via of [null, "@tailwindcss/vite", "@tailwindcss/postcss", "tailwindcss"]) {
    try {
      return via ? createRequire(req.resolve(via)).resolve(name) : req.resolve(name);
    } catch {
      // not resolvable this way; try the next
    }
  }
  return undefined;
};
const homes = [tailwindFrom, root, self].filter(Boolean);
const home = homes.find((dir) => requireFrom(dir, "@tailwindcss/node"));
const nodePath = home && requireFrom(home, "@tailwindcss/node");
if (!nodePath) {
  console.error("check-design-css needs @tailwindcss/node, resolvable from the package or from @simplix-react/ui");
  process.exit(1);
}
const { compile } = await import(pathToFileURL(nodePath).href);

// Every rule body is "@apply <classes>;"; each class is compiled alone so a failure names it.
let bad = 0;
for (const file of targets) {
  const text = readFileSync(file, "utf8");
  const classes = new Map();
  for (const m of text.matchAll(/:where\(\[data-(?:slot|part)="([^"]+)"[^{]*\{\s*@apply ([^;]+);/g)) {
    for (const c of m[2].split(/\s+/)) if (!classes.has(c)) classes.set(c, m[1]);
  }
  const base = `@import "tailwindcss";\n@import "${join(self, "src/theme/base.css")}";\n@custom-variant dark (&:is(.dark *));\n`;
  for (const [cls, slot] of classes) {
    try {
      await compile(`${base}.probe { @apply ${cls}; }`, { base: home, onDependency: () => {} });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      bad++;
      console.log(`✖ ${file.split("/").slice(-1)[0]} ${slot}: ${cls}`);
    }
  }
  console.log(`${file.split("/").slice(-1)[0]}: ${classes.size} classes checked`);
}
process.exitCode = bad ? 1 : 0;
