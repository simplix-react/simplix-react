#!/usr/bin/env node
// Every slot and variant value the classic stylesheet draws must be drawn by every other design.
// A slot a design leaves out renders unstyled under it, because classic rules match only classic.
// Usage: check-design-coverage [<classic.css> <design.css>...]   (default: this package's designs)
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const dir = "src/theme/designs";
const args = process.argv.slice(2);
const [classicFile, ...others] = args.length
  ? args
  : [join(dir, "classic.css"), ...readdirSync(dir).filter((f) => f.endsWith(".css") && f !== "classic.css").map((f) => join(dir, f))];

const keysOf = (file) => {
  const keys = new Set();
  for (const m of readFileSync(file, "utf8").matchAll(/\[data-slot="([^"]+)"\]((?:\[data-[a-z-]+="[^"]*"\])*)/g)) {
    const axes = [...m[2].matchAll(/\[data-([a-z-]+)="([^"]*)"\]/g)].map((a) => `${a[1]}=${a[2]}`);
    keys.add(axes.length ? `${m[1]} ${axes.join(" ")}` : m[1]);
  }
  return keys;
};

const classic = keysOf(classicFile);
let missingTotal = 0;
for (const file of others) {
  const drawn = keysOf(file);
  // A design that draws a value exactly like the slot's base still writes the selector, with an
  // empty body or a comment, so a value nobody considered is told apart from one drawn the same.
  const missing = [...classic].filter((k) => !drawn.has(k));
  missingTotal += missing.length;
  console.log(`${basename(file)}: ${classic.size - missing.length}/${classic.size} classic rules covered`);
  for (const k of missing.slice(0, 40)) console.log(`  ✖ ${k}`);
  if (missing.length > 40) console.log(`  … ${missing.length - 40} more`);
}
process.exitCode = missingTotal ? 1 : 0;
