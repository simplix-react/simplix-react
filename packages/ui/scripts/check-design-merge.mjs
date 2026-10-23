#!/usr/bin/env node
// Reports slot declarations that draw a `leading-*` class tailwind-merge would have dropped.
//
// A class string on an element went through `cn()`, and tailwind-merge drops a `leading-*` that a
// later `text-{size}` follows. A slot declaration is applied by the stylesheet with no merge, and
// a `text-{size}` utility reads its line height from `--tw-leading`, so the leading the element
// never had is drawn and the line box changes. Each hit is a declaration whose base plus one
// variant value keeps such a pair; the fix is to drop the leading class the element never drew.
//
//   node scripts/check-design-merge.mjs [dir]   (default: src; exits 1 when it reports anything)
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const self = join(dirname(fileURLToPath(import.meta.url)), "..");
const req = createRequire(join(self, "package.json"));
const { build } = createRequire(req.resolve("tsup"))("esbuild");
const { twMerge } = req("tailwind-merge");

const root = resolve(process.argv[2] ?? join(self, "src"));
const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") walk(path);
    } else if (entry.name.endsWith(".style.ts")) files.push(path);
  }
};
walk(root);

const entry = files.map((file, i) => `export * as m${i} from ${JSON.stringify(file)};`).join("\n");
const bundled = await build({
  stdin: { contents: entry, resolveDir: self, loader: "ts" },
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
});
const modules = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);

const isSlotStyle = (v) => v && typeof v === "object" && typeof v.slot === "string" && typeof v.base === "string";
const words = (s) => s.split(/\s+/).filter(Boolean);
const hits = [];
for (const mod of Object.values(modules)) {
  for (const style of Object.values(mod)) {
    if (!isSlotStyle(style)) continue;
    const combos = [style.base, ...Object.values(style.variants).flatMap((values) => Object.values(values).map((v) => `${style.base} ${v}`))];
    for (const combo of combos) {
      const kept = new Set(words(twMerge(combo)));
      const dropped = words(combo).filter((c) => /(^|:)leading-/.test(c) && !kept.has(c));
      if (dropped.length) {
        hits.push(`${style.slot}: draws ${[...new Set(dropped)].join(" ")}, which cn() dropped from "${combo.trim()}"`);
        break;
      }
    }
  }
}
for (const hit of hits) console.log(hit);
console.log(`${hits.length} merge-dropped leading classes in ${files.length} declaration files`);
process.exit(hits.length ? 1 : 0);
