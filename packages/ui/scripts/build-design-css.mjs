#!/usr/bin/env node
// Writes the classic design stylesheet from every slot declaration (*.style.ts) under a source tree.
//   build-design-css [--root <package dir>] [--out <file>] [--design-spec <file.ts>] [--check]
// Without --design-spec it writes the classic design, the declarations as written. With it, it
// writes the design the spec names: every declaration with the spec's class replacements applied
// and its per-slot overrides merged over the result (tailwind-merge, so an override replaces the
// classes it conflicts with), scoped to that design. A design drawn this way covers every slot
// the classic design draws, by construction.
// --root defaults to this package and --out to its src/theme/designs/classic.css; a kit passes its
// own root and output. --check exits 1 when the file differs from what the declarations produce.
import { mkdirSync, readdirSync, rmSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const self = join(dirname(fileURLToPath(import.meta.url)), "..");
const option = (name) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const root = resolve(option("--root") ?? self);
const specFile = option("--design-spec") ? resolve(root, option("--design-spec")) : undefined;
const target = resolve(root, option("--out") ?? "src/theme/designs/classic.css");
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : name.endsWith(".style.ts") ? [path] : [];
  });
const files = walk(join(root, "src")).map((p) => relative(root, p)).sort();
const generatedBy = relative(root, target);

// The declarations are TypeScript; esbuild (a dev dependency through tsup) bundles them to a module
// whose default export lists every exported declaration, file by file in path order.
const entry =
  files.map((f, i) => `export * as m${i} from "./${f}";`).join("\n") +
  (specFile ? `\nexport { default as __spec } from ${JSON.stringify(specFile)};` : "");
// A kit's declarations import defineSlotStyle from this package; it is bundled from source here.
// esbuild comes from the package being generated for, else from this one (a kit has it through
// its bundler, this package through tsup).
// esbuild is usually a dependency of the bundler rather than of the package, so it is looked up
// directly and then through tsup and vite.
const requireFrom = (dir) => {
  const req = createRequire(join(dir, "package.json"));
  for (const via of [null, "tsup", "vite"]) {
    try {
      return via ? createRequire(req.resolve(via))("esbuild") : req("esbuild");
    } catch {
      // not resolvable this way; try the next
    }
  }
  return undefined;
};
const esbuild = requireFrom(root) ?? requireFrom(self);
if (!esbuild) {
  console.error("build-design-css needs esbuild, resolvable from the package or from @simplix-react/ui");
  process.exit(1);
}
const { outputFiles } = esbuild.buildSync({
  stdin: { contents: entry, resolveDir: root, sourcefile: "entry.ts", loader: "ts" },
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  logLevel: "error",
  alias: { "@simplix-react/ui/design": join(self, "src/design/index.ts"), "@simplix-react/ui": join(self, "src/design/index.ts") },
  external: ["class-variance-authority"],
});
const bundled = outputFiles[0].text;

// class-variance-authority stays external, so the bundle is loaded from a file beside this
// package's node_modules rather than from a data URL, which could not resolve it.
const tmp = join(self, `node_modules/.cache/design-css-entry-${process.pid}.mjs`);
mkdirSync(dirname(tmp), { recursive: true });
writeFileSync(tmp, bundled);
const modules = await import(pathToFileURL(tmp).href);
rmSync(tmp);
const isSlotStyle = (v) => v && typeof v === "object" && typeof v.slot === "string" && typeof v.base === "string";
const CLASSIC_SLOTS = files.flatMap((_, i) => Object.values(modules[`m${i}`]).filter(isSlotStyle));
// tw-animate-css entry and exit motion is not part of a design: it is the same in every design,
// and a design stylesheet compiled where that plugin is absent cannot @apply it. It stays on the
// element.
const MOTION = /(?:^|:)(?:animate-in|animate-out|fade-(?:in|out)(?:-\d+)?|zoom-(?:in|out)(?:-\d+)?|slide-(?:in|out)-from-[a-z]+(?:-\d+)?|spin-(?:in|out)(?:-\d+)?|animate-collapsible-(?:up|down))$/;
const motionHits = [];
for (const style of CLASSIC_SLOTS) {
  const strings = [style.base, ...Object.values(style.variants).flatMap((v) => Object.values(v))];
  for (const cls of strings.join(" ").split(/\s+/)) if (MOTION.test(cls)) motionHits.push(`${style.slot}: ${cls}`);
}
if (motionHits.length) {
  console.error("motion classes belong on the element, not in a slot declaration:\n  " + motionHits.join("\n  "));
  process.exit(1);
}
const seen = new Set();
for (const style of CLASSIC_SLOTS) {
  if (seen.has(style.slot)) {
    console.error(`slot "${style.slot}" is declared twice`);
    process.exit(1);
  }
  seen.add(style.slot);
}

const spec = modules.__spec;
const SCOPE = spec ? `:where([data-design="${spec.id}"])` : ':where(:root:not([data-design]), [data-design="classic"])';
// The classes a declaration draws under this design.
const requireSelf = createRequire(join(self, "package.json"));
const { twMerge } = requireSelf("tailwind-merge");
const drawn = (slot, key, classes) => {
  if (!spec) return classes;
  const replaced = classes.split(/\s+/).filter(Boolean).map((c) => spec.replace?.[c] ?? c).filter(Boolean).join(" ");
  const override = spec.slots?.[key];
  return override === undefined ? replaced : twMerge(replaced, override);
};
const partRule = (attrs, classes) =>
  classes.trim() ? `  ${SCOPE} :where(${attrs})[data-part] {\n    @apply ${classes.trim().split(/\s+/).join(" ")};\n  }\n` : "";
const rule = (attrs, classes) =>
  classes.trim() ? `  ${SCOPE} :where(${attrs}) {\n    @apply ${classes.trim().split(/\s+/).join(" ")};\n  }\n` : "";

// The rules sit in the utilities layer with every selector wrapped in :where(), so they carry
// no specificity of their own: a caller's className utility outranks them exactly as it outranked
// the class string the element used to carry, and a component-layer rule still does not.
let css = `/* Generated by @simplix-react/ui scripts/build-design-css.mjs from the .style.ts declarations under src${spec ? ` and the ${spec.id} design spec` : ""}. Do not edit. */\n\n@layer utilities {\n`;
// Part declarations first, then slot declarations. A part rule carries one class of
// specificity (data-part), so it wins over the plain rules of the component it marks wherever
// it sits; written first, it still loses to that component's own :hover, :focus and dark: rules,
// which carry the same one class and come later. That is the order a caller's class used to
// have against the component's class string.
for (const style of CLASSIC_SLOTS.filter((s) => s.as === "part")) {
  const part = `[data-part="${style.slot}"]`;
  css += partRule(part, drawn(style.slot, style.slot, style.base));
  for (const [axis, values] of Object.entries(style.variants)) {
    for (const [value, classes] of Object.entries(values)) {
      css += partRule(`${part}[data-part-${axis}="${value}"]`, drawn(style.slot, `${style.slot} ${axis}=${value}`, classes));
    }
  }
}
for (const style of CLASSIC_SLOTS.filter((s) => s.as !== "part")) {
  const slot = `[data-slot="${style.slot}"]`;
  css += rule(slot, drawn(style.slot, style.slot, style.base));
  for (const [axis, values] of Object.entries(style.variants)) {
    for (const [value, classes] of Object.entries(values)) {
      css += rule(`${slot}[data-${axis}="${value}"]`, drawn(style.slot, `${style.slot} ${axis}=${value}`, classes));
    }
  }
}
css += "}\n";

if (process.argv.includes("--check")) {
  const current = readFileSync(target, "utf8");
  if (current !== css) {
    console.error(`${generatedBy} is stale: run build-design-css`);
    process.exit(1);
  }
  console.log(`${generatedBy} current (${CLASSIC_SLOTS.length} slots)`);
} else {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, css);
  console.log(`wrote ${generatedBy} (${CLASSIC_SLOTS.length} slots)`);
}
