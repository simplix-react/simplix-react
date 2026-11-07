#!/usr/bin/env node
// Writes the classic design stylesheet from every slot declaration (*.style.ts) under a source tree.
//   build-design-css [--root <package dir>] [--out <file>] [--design-spec <file.ts>]
//                    [--compiled <file.ts> --tailwind-from <dir> [--tokens <file.css>]
//                     [--reference <file.css>]] [--check]
// --reference names a stylesheet whose own utilities the declarations apply (a kit's app.css).
// Without --design-spec it writes the classic design, the declarations as written. With it, it
// writes the design the spec names: every declaration with the spec's class replacements applied
// and its per-slot overrides merged over the result (tailwind-merge, so an override replaces the
// classes it conflicts with), scoped to that design. A design drawn this way covers every slot
// the classic design draws, by construction.
//
// A design other than classic is not imported into a stylesheet: a page carrying the rules of a
// design it does not show pays for them (Safari re-checks every scoped rule on each rendering
// update). --compiled writes it, with its tokens, as plain CSS in a TypeScript module the design's
// load() imports on demand, so only the active design's rules are on the page.
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
const requireFrom = (dir, name = "esbuild", pathOnly = false) => {
  const req = createRequire(join(dir, "package.json"));
  for (const via of [null, "tsup", "vite", "@tailwindcss/vite", "@tailwindcss/postcss"]) {
    try {
      const r = via ? createRequire(req.resolve(via)) : req;
      return pathOnly ? r.resolve(name) : r(name);
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
// A design restates look, never scroll geometry: an override that makes an element a scroll
// container (overflow hidden, auto or scroll) also drops a flex item's content-based minimum
// height, so the element shrinks into its parent and clips what it holds. Clipping corners is
// overflow-clip, which is not a scroll container; Safari still drops the minimum for it, so a
// clipped flex item also states shrink-0.
if (modules.__spec) {
  const SCROLLER = /(?:^|:)overflow(?:-[xy])?-(?:hidden|auto|scroll)$/;
  const hits = Object.entries(modules.__spec.slots ?? {}).flatMap(([key, classes]) =>
    classes.split(/\s+/).filter((c) => SCROLLER.test(c)).map((c) => `${key}: ${c}`));
  if (hits.length) {
    console.error("a design override may not make a scroll container (use overflow-clip to clip corners):\n  " + hits.join("\n  "));
    process.exit(1);
  }
}
// slotAttributes writes each axis as `data-<axis>` verbatim, and HTML lowercases attribute names,
// so an axis with an uppercase letter is an invalid attribute in React and its rules never match.
const casedAxes = CLASSIC_SLOTS.flatMap((style) => Object.keys(style.variants).filter((axis) => /[A-Z]/.test(axis)).map((axis) => `${style.slot}: ${axis}`));
if (casedAxes.length) {
  console.error("a variant axis is written in lowercase (it becomes a data- attribute):\n  " + casedAxes.join("\n  "));
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
// The classes a declaration draws under a design; classic draws them as declared.
const requireSelf = createRequire(join(self, "package.json"));
const { twMerge } = requireSelf("tailwind-merge");
// A design class without a scheme variant paints both schemes, since its tokens already carry the
// scheme. So it also replaces the declaration's `dark:` class of the same property: left in, that
// class outranks the design in the dark scheme (it sits in the utilities layer) and pairs the
// declaration's dark ground with the design's foreground, which nobody chose together.
const SCHEME = "dark:";
const sameProperty = (a, b) => twMerge(`${a} ${b}`).split(/\s+/).length === 1;
const schemeRepainted = (cls, overrides) =>
  cls.startsWith(SCHEME) && !cls.slice(SCHEME.length).includes(":") && overrides.some((o) => !o.includes(":") && sameProperty(cls.slice(SCHEME.length), o));
const drawnFor = (design) => (slot, key, classes) => {
  if (!design) return classes;
  const replaced = classes.split(/\s+/).filter(Boolean).map((c) => design.replace?.[c] ?? c).filter(Boolean);
  const override = design.slots?.[key];
  if (override === undefined) return replaced.join(" ");
  const overrides = override.split(/\s+/).filter(Boolean);
  return twMerge(replaced.filter((c) => !schemeRepainted(c, overrides)).join(" "), override);
};
const apply = (selector, classes) =>
  classes.trim() ? `  ${selector} {\n    @apply ${classes.trim().split(/\s+/).join(" ")};\n  }\n` : "";

// Every design writes the same selectors, unscoped: a page carries only one design besides
// classic (classic in theme.css, any other injected by UIProvider while it is chosen, after
// classic), so no rule needs to ask which design is in force.
//
// Every rule whose rightmost compound is the slot element names the slot's own attribute
// (data-s-<slot>, data-p-<part>; slotAttributes and partAttributes write it) in that compound.
// Safari files a rule under the last attribute name of its rightmost compound and checks an
// element only against the rules filed under the attributes it carries. A rightmost compound of
// :where() alone is filed nowhere, and one ending on data-slot or data-<axis> is filed with every
// other slot's; either way every slot element is checked against all of them on every style
// update, and each frame takes two to three times as long as on a page without them.
//
// A slot's plain classes (no variant) sit in the components layer, below utilities, so a caller's
// className utility outranks them whatever its specificity. They are padded to one specificity
// ([data-slot] repeats in the base rule), so source order decides between them.
//
// Everything else sits in the utilities layer as :where() around the slot's compound followed by
// the slot's attribute: variant classes (:hover, :focus, dark:, descendant and child rules),
// !important classes and every part rule. The attribute gives each of them the same one class of
// specificity, so they keep their order against one another and win over the plain classes, and
// a descendant rule outranks a caller's utility on the descendant. Part rules come first and
// carry [data-part] as well, so a part wins over the plain rules of the component it marks and
// loses to that component's :hover, :focus and dark: rules, the order a caller's class has
// against a component's class string.
//
// An !important class goes with the variants: important declarations rank the layers the other
// way round, and in the components layer it would outrank every important utility.
const variantOf = (cls) => {
  if (cls.startsWith("!") || cls.endsWith("!")) return true;
  let depth = 0;
  for (const ch of cls) {
    if (ch === "[" || ch === "(") depth++;
    else if (ch === "]" || ch === ")") depth--;
    else if (ch === ":" && depth === 0) return true;
  }
  return false;
};
const split = (classes) => {
  const list = classes.split(/\s+/).filter(Boolean);
  return [list.filter((c) => !variantOf(c)).join(" "), list.filter(variantOf).join(" ")];
};
const render = (design) => {
  const drawn = drawnFor(design);
  let plain = "";
  let rest = "";
  for (const style of CLASSIC_SLOTS.filter((s) => s.as === "part")) {
    const part = `[data-part="${style.slot}"]`;
    const key = `[data-part][data-p-${style.slot}]`;
    rest += apply(`:where(${part})${key}`, drawn(style.slot, style.slot, style.base));
    for (const [axis, values] of Object.entries(style.variants)) {
      for (const [value, classes] of Object.entries(values)) {
        rest += apply(`:where(${part}[data-part-${axis}="${value}"])${key}`, drawn(style.slot, `${style.slot} ${axis}=${value}`, classes));
      }
    }
  }
  for (const style of CLASSIC_SLOTS.filter((s) => s.as !== "part")) {
    const slot = `[data-slot="${style.slot}"]`;
    const key = `[data-s-${style.slot}]`;
    const both = (compound, padded, classes) => {
      const [p, v] = split(classes);
      plain += apply(`${padded}${key}`, p);
      rest += apply(`:where(${compound})${key}`, v);
    };
    both(slot, `${slot}[data-slot]`, drawn(style.slot, style.slot, style.base));
    for (const [axis, values] of Object.entries(style.variants)) {
      for (const [value, classes] of Object.entries(values)) {
        const compound = `${slot}[data-${axis}="${value}"]`;
        both(compound, compound, drawn(style.slot, `${style.slot} ${axis}=${value}`, classes));
      }
    }
  }
  return `@layer components {\n${plain}}\n@layer utilities {\n${rest}}\n`;
};
const header = `/* Generated by @simplix-react/ui scripts/build-design-css.mjs from the .style.ts declarations under src${spec ? ` and the ${spec.id} design spec` : ""}. Do not edit. */\n\n`;
const css = header + render(spec);

let compiledModule;
if (option("--compiled")) {
  const homes = [option("--tailwind-from") && resolve(option("--tailwind-from")), root, self].filter(Boolean);
  const nodePath = homes.map((dir) => requireFrom(dir, "@tailwindcss/node", true)).find(Boolean);
  if (!nodePath) {
    console.error("--compiled needs @tailwindcss/node, resolvable from --tailwind-from, the package or @simplix-react/ui");
    process.exit(1);
  }
  const { compile, optimize } = await import(pathToFileURL(nodePath).href);
  const tokens = option("--tokens") ? readFileSync(resolve(root, option("--tokens")), "utf8") : "";
  const extra = option("--reference") ? `@reference "${resolve(root, option("--reference"))}";\n` : "";
  const source = `@reference "tailwindcss";\n@reference "${join(self, "src/theme/base.css")}";\n${extra}@custom-variant dark (&:is(.dark *));\n${tokens}\n${css}`;
  const home = homes.find((dir) => requireFrom(dir, "@tailwindcss/node", true));
  const tailwind = async (text) =>
    (await compile(text, { base: home, onDependency: () => {} })).build([]).replace(/^\/\*! tailwindcss[^*]*\*\/\n/, "");
  const prelude = source.slice(0, source.indexOf(css));
  const builtDesign = await tailwind(source);
  const builtClassic = await tailwind(prelude.replace(tokens, "") + render(undefined));
  // A design is injected after classic and shares its layer, so classic's declarations stay in
  // force wherever the design leaves a property unset. For each such property the design writes
  // revert-layer, which falls back past that rule's layer to what the element had from the
  // layers below; a caller's utility on the same property still outranks it by specificity.
  const postcss = (await import(pathToFileURL(homes.map((d) => requireFrom(d, "postcss", true)).find(Boolean)).href)).default;
  const keyOf = (node) => {
    const chain = [];
    for (let n = node.parent; n && n.type !== "root"; n = n.parent) if (n.type === "atrule") chain.unshift(`@${n.name} ${n.params}`);
    return `${chain.join(" > ")} | ${node.selector}`;
  };
  const props = (root) => {
    const map = new Map();
    root.walkRules((r) => {
      const k = keyOf(r);
      const set = map.get(k) ?? { rule: r, props: new Set() };
      r.each((d) => d.type === "decl" && set.props.add(d.prop));
      map.set(k, set);
    });
    return map;
  };
  const designRoot = postcss.parse(builtDesign);
  const drawnProps = props(designRoot);
  let reverts = "";
  // Shorthands and logical properties are compared as the physical longhands they set, so a
  // design's py-3 (padding-block) covers classic's pt-* (padding-top), and a design that sets only
  // padding-top under classic's padding-block reverts padding-bottom alone rather than its own value.
  const sides = (base, suffix = "") => ["top", "right", "bottom", "left"].map((d) => `${base}-${d}${suffix}`);
  const box = (base, suffix = "") => {
    const [top, right, bottom, left] = sides(base, suffix);
    return { [`${base}${suffix}`]: [top, right, bottom, left], [`${base}-block${suffix}`]: [top, bottom], [`${base}-inline${suffix}`]: [left, right],
      [`${base}-block-start${suffix}`]: [top], [`${base}-block-end${suffix}`]: [bottom], [`${base}-inline-start${suffix}`]: [left], [`${base}-inline-end${suffix}`]: [right] };
  };
  const corners = ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"];
  const LONGHANDS = {
    ...box("padding"), ...box("margin"), ...box("scroll-margin"), ...box("scroll-padding"), ...box("border", "-width"), ...box("border", "-style"), ...box("border", "-color"),
    inset: ["top", "right", "bottom", "left"], "inset-block": ["top", "bottom"], "inset-inline": ["left", "right"],
    "inset-inline-start": ["left"], "inset-inline-end": ["right"], "inset-block-start": ["top"], "inset-block-end": ["bottom"],
    "border-radius": corners, "border-start-start-radius": [corners[0]], "border-start-end-radius": [corners[1]],
    "border-end-end-radius": [corners[2]], "border-end-start-radius": [corners[3]],
    gap: ["row-gap", "column-gap"], overflow: ["overflow-x", "overflow-y"],
  };
  const longhands = (prop) => LONGHANDS[prop] ?? [prop];
  for (const [k, { rule, props: classicProps }] of props(postcss.parse(builtClassic))) {
    const covered = new Set([...(drawnProps.get(k)?.props ?? [])].flatMap(longhands));
    const missing = [...classicProps].flatMap((p) => {
      const parts = longhands(p);
      const open = parts.filter((l) => !covered.has(l));
      return open.length === parts.length ? [p] : open;
    });
    if (!missing.length) continue;
    const chain = [];
    for (let n = rule.parent; n && n.type !== "root"; n = n.parent) if (n.type === "atrule") chain.unshift(n);
    const open = chain.map((n) => `@${n.name} ${n.params} {`).join(" ");
    reverts += `${open} ${rule.selector} { ${missing.map((p) => `${p}: revert-layer;`).join(" ")} } ${"}".repeat(chain.length)}\n`;
  }
  // Lowered the way an app's own Tailwind build lowers its stylesheet: compile() leaves each
  // variant as a nested rule (&:hover, &:is(.dark *)), which Safari reads as :is(<parent>):hover,
  // a selector whose rightmost compound is filed under no attribute and checked against every element.
  const built = optimize(builtDesign + (reverts ? `\n/* properties classic sets and this design leaves unset */\n${reverts}` : "")).code;
  // Stored base64-encoded: an app's Tailwind scans this package's sources and builds, and plain CSS
  // text here would read to it as thousands of class names, each generated into the app's
  // stylesheet. A base64 run has no separators, so it yields none.
  const encoded = Buffer.from(built, "utf8").toString("base64");
  compiledModule = `// Generated by @simplix-react/ui scripts/build-design-css.mjs: the ${modules.__spec.id} design compiled to plain CSS. Do not edit.\nconst encoded = "${encoded}";\nconst css: string = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)));\nexport default css;\n`;
}
const compiledTarget = option("--compiled") ? resolve(root, option("--compiled")) : undefined;

if (process.argv.includes("--check")) {
  const current = readFileSync(target, "utf8");
  if (current !== css) {
    console.error(`${generatedBy} is stale: run build-design-css`);
    process.exit(1);
  }
  if (compiledTarget && readFileSync(compiledTarget, "utf8") !== compiledModule) {
    console.error(`${relative(root, compiledTarget)} is stale: run build-design-css`);
    process.exit(1);
  }
  console.log(`${generatedBy} current (${CLASSIC_SLOTS.length} slots)`);
} else {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, css);
  if (compiledTarget) writeFileSync(compiledTarget, compiledModule);
  console.log(`wrote ${generatedBy} (${CLASSIC_SLOTS.length} slots)${compiledTarget ? ` and ${relative(root, compiledTarget)}` : ""}`);
}
