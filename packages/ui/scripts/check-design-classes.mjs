#!/usr/bin/env node
// Lists look classes still written on elements in component files. A component's look belongs in
// its .style.ts declaration (drawn by theme/designs/*.css); what stays in the component is
// structure: display, flex and grid flow, position, overflow, sizing that the behaviour depends on.
// Usage: check-design-classes [--max N] [paths...]   exits 1 when more than N sites remain (default 0).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const LOOK = /^(?:[a-z-]+:)*(?:-?(?:bg|text|border|rounded|shadow|ring|outline|fill|stroke|font|leading|tracking|opacity|p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|divide|decoration|underline|from|via|to|accent|caret|placeholder|backdrop|blur|transition|duration|ease|animate)(?:-|$))/;
// tw-animate-css entry and exit motion stays on the element in every design (build-design-css
// refuses it in a declaration), so it is not a look class here.
const MOTION = /(?:^|:)(?:animate-in|animate-out|fade-(?:in|out)(?:-\d+)?|zoom-(?:in|out)(?:-\d+)?|slide-(?:in|out)-from-[a-z]+(?:-\d+)?|spin-(?:in|out)(?:-\d+)?|animate-collapsible-(?:up|down))$/;
const isLook = (cls) => LOOK.test(cls) && !MOTION.test(cls);
const root = process.cwd();
const args = process.argv.slice(2);
const maxIdx = args.indexOf("--max");
const max = maxIdx >= 0 ? Number(args[maxIdx + 1]) : 0;
const targets = args.filter((a, i) => !a.startsWith("--") && (maxIdx < 0 || i !== maxIdx + 1));
const walk = (p) => (statSync(p).isDirectory() ? readdirSync(p).flatMap((n) => walk(join(p, n))) : [p]);
const files = (targets.length ? targets : ["src"]).flatMap(walk)
  .filter((f) => f.endsWith(".tsx") && !f.includes("__tests__") && !f.includes(".stories."));

let total = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const hits = [];
  // String literals inside className={...} / cn(...) and plain className="..." attributes.
  for (const m of text.matchAll(/className=(?:"([^"]*)"|\{([\s\S]*?)\}\s*(?:\n|\/?>|[a-zA-Z-]+=))/g)) {
    const chunk = m[1] ?? m[2] ?? "";
    for (const lit of chunk.matchAll(/["'`]([^"'`]*)["'`]/g).toArray?.() ?? [...chunk.matchAll(/["'`]([^"'`]*)["'`]/g)]) {
      for (const cls of lit[1].split(/\s+/)) if (cls && isLook(cls)) hits.push(cls);
    }
    if (m[1]) for (const cls of m[1].split(/\s+/)) if (cls && isLook(cls)) hits.push(cls);
  }
  for (const m of text.matchAll(/\bcn\(([\s\S]*?)\)/g)) {
    for (const lit of m[1].matchAll(/["'`]([^"'`]*)["'`]/g)) for (const cls of lit[1].split(/\s+/)) if (cls && isLook(cls)) hits.push(cls);
  }
  const unique = [...new Set(hits)];
  if (unique.length) {
    total += unique.length;
    console.log(`${relative(root, file)}: ${unique.length}  ${unique.slice(0, 8).join(" ")}${unique.length > 8 ? " …" : ""}`);
  }
}
console.log(`${total} look classes in ${files.length} component files`);
process.exitCode = total > max ? 1 : 0;
