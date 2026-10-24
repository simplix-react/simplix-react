#!/usr/bin/env node
// Refuses a slot or part attribute that can never match the element it names.
//
// 1. A spread onto a component that writes its own. `slotAttributes(style)` names an element's slot
//    with `data-slot`; a component such as Flex or Stack writes its own `data-slot` after the
//    caller's props, so the spread one is overwritten and the declaration's rules never match the
//    element. The same holds for `partAttributes` and `data-part`. Such an element takes
//    `partAttributes` (when the component does not write a part of its own) or a plain wrapper.
// 2. A selector keyed on the wrong attribute. A declaration with `as: "part"` marks its element
//    with `data-part`, so a rule anywhere that selects it as `[data-slot=<name>]` matches nothing;
//    it is selected as `[data-part=<name>]`.
//
// Owners are found from the component sources: a component owns `data-slot` when the element that
// receives its rest props writes `data-slot` (or spreads slot attributes) after that rest spread,
// or passes the rest props last to another component that owns it. Every directory given is read
// for owners and parts and checked; the `@simplix-react/ui` sources reachable from the working
// directory are read too, so a package that renders the framework's components is checked against
// them.
// Usage: check-slot-spread [paths...]   (default: src). Exits 1 when anything is refused.
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const cwd = process.cwd();
const targets = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const roots = (targets.length ? targets : ["src"]).map((p) => resolve(cwd, p));

/** The framework's own sources, when the working package depends on it (or is it). */
function frameworkSources() {
  const own = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src");
  const candidates = [own];
  try {
    const pkg = createRequire(join(cwd, "package.json")).resolve("@simplix-react/ui/package.json");
    candidates.push(join(dirname(pkg), "src"));
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error)) throw error;
  }
  return candidates.filter((dir) => existsSync(dir)).map((dir) => realpathSync(dir));
}

const walk = (p) => (statSync(p).isDirectory() ? readdirSync(p).flatMap((n) => walk(join(p, n))) : [p]);
const isSource = (f) => f.endsWith(".tsx") && !f.includes("__tests__") && !f.includes(".stories.") && !f.includes(".test.");
const checked = new Set(roots.flatMap(walk).filter(isSource).map((f) => realpathSync(f)));
const read = new Set([...checked, ...[...new Set(frameworkSources())].flatMap(walk).filter(isSource).map((f) => realpathSync(f))]);

const ATTRIBUTE = { slot: "data-slot", part: "data-part" };
const HELPER = { slotAttributes: "slot", partAttributes: "part" };

/** The helper a spread expression calls, directly or through a local bound to the call. */
function spreadKind(expression, locals) {
  if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) return HELPER[expression.expression.text];
  if (ts.isIdentifier(expression)) return locals.get(expression.text);
  return undefined;
}

/** Locals bound to a slotAttributes / partAttributes call inside a function body. */
function helperLocals(body) {
  const locals = new Map();
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const kind = spreadKind(node.initializer, new Map());
      if (kind) locals.set(node.name.text, kind);
    }
    ts.forEachChild(node, visit);
  };
  visit(body);
  return locals;
}

/** The names a component's first parameter hands on as the rest of its props. */
function restNames(fn) {
  const param = fn.parameters?.[0];
  if (!param) return [];
  if (ts.isIdentifier(param.name)) return [param.name.text];
  if (ts.isObjectBindingPattern(param.name)) {
    return param.name.elements.filter((e) => e.dotDotDotToken && ts.isIdentifier(e.name)).map((e) => e.name.text);
  }
  return [];
}

const tagName = (el) => (ts.isIdentifier(el.tagName) ? el.tagName.text : el.tagName.getText());
const isComponentTag = (name) => /^[A-Z]/.test(name);

// name -> { slot: bool, part: bool, via: Set<name> }
const owners = new Map();
const aliases = new Map();
const sources = new Map();

function functionOf(init) {
  if (!init) return undefined;
  if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) return init;
  if (ts.isCallExpression(init)) {
    // forwardRef(fn), memo(fn), memo(forwardRef(fn)), or a wrapper naming another component.
    for (const arg of init.arguments) {
      const fn = functionOf(arg);
      if (fn) return fn;
    }
  }
  return undefined;
}

function aliasOf(init) {
  if (init && ts.isCallExpression(init)) {
    const last = init.arguments.at(-1);
    if (last && ts.isIdentifier(last) && isComponentTag(last.text)) return last.text;
  }
  if (init && ts.isIdentifier(init) && isComponentTag(init.text)) return init.text;
  return undefined;
}

function analyseComponent(name, fn) {
  const entry = { slot: false, part: false, via: new Set() };
  const rests = new Set(restNames(fn));
  const locals = helperLocals(fn.body ?? fn);
  const visit = (node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const props = node.attributes.properties;
      const at = props.findIndex((p) => ts.isJsxSpreadAttribute(p) && ts.isIdentifier(p.expression) && rests.has(p.expression.text));
      if (at >= 0) {
        const after = props.slice(at + 1);
        for (const p of after) {
          if (ts.isJsxAttribute(p)) {
            const attr = p.name.getText();
            if (attr === ATTRIBUTE.slot) entry.slot = true;
            if (attr === ATTRIBUTE.part) entry.part = true;
          } else if (ts.isJsxSpreadAttribute(p)) {
            const kind = spreadKind(p.expression, locals);
            if (kind) entry[kind] = true;
          }
        }
        const tag = tagName(node);
        if (isComponentTag(tag)) entry.via.add(tag);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(fn.body ?? fn);
  owners.set(name, entry);
}

for (const file of read) {
  const text = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  sources.set(file, sf);
  const visit = (node) => {
    if (ts.isFunctionDeclaration(node) && node.name && isComponentTag(node.name.text) && node.body) {
      analyseComponent(node.name.text, node);
    } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && isComponentTag(node.name.text)) {
      const fn = functionOf(node.initializer);
      if (fn) analyseComponent(node.name.text, fn);
      else {
        const alias = aliasOf(node.initializer);
        if (alias) aliases.set(node.name.text, alias);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

/** Whether the named component ends up writing the attribute itself. */
function owns(name, kind, seen = new Set()) {
  if (seen.has(name)) return false;
  seen.add(name);
  const alias = aliases.get(name);
  if (alias && !owners.has(name)) return owns(alias, kind, seen);
  const entry = owners.get(name);
  if (!entry) return false;
  if (entry[kind]) return true;
  return [...entry.via].some((next) => owns(next, kind, seen));
}

let refused = 0;
for (const file of checked) {
  const sf = sources.get(file);
  // A spread of a local bound to the helper (`const look = slotAttributes(...)`) counts as the call.
  const fileLocals = helperLocals(sf);
  const visit = (node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      // A member tag (`SelectPrimitive.Label`) is a third-party part whose source is not read here.
      const tag = tagName(node);
      const base = ts.isIdentifier(node.tagName) ? tag : "";
      if (isComponentTag(base)) {
        for (const p of node.attributes.properties) {
          if (!ts.isJsxSpreadAttribute(p)) continue;
          const kind = spreadKind(p.expression, fileLocals);
          if (kind && owns(base, kind)) {
            const { line } = sf.getLineAndCharacterOfPosition(p.getStart());
            const helper = kind === "slot" ? "slotAttributes" : "partAttributes";
            const fix = kind === "slot" ? "use partAttributes or a plain element" : "use a plain wrapper element";
            console.log(`${relative(cwd, file)}:${line + 1}  <${tag}> writes its own ${ATTRIBUTE[kind]}, so ${helper}(...) never reaches the element; ${fix}`);
            refused += 1;
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

console.log(`${refused} refused slot/part spreads in ${checked.size} component files`);

// Pass 2: selectors that name a part by its slot attribute.
// Selectors live in declarations, design fragments and components alike (a query string, a class).
const isStyleSource = (f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.endsWith(".d.ts") && !f.includes("__tests__") && !f.includes(".test.") && !f.includes(".stories.");
const styleRead = new Set([...roots, ...frameworkSources()].flatMap(walk).filter(isStyleSource).map((f) => realpathSync(f)));
const styleChecked = new Set(roots.flatMap(walk).filter(isStyleSource).map((f) => realpathSync(f)));
const parts = new Set();
const slots = new Set();
for (const file of styleRead) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/defineSlotStyle\(\{\s*slot:\s*"([^"]+)",\s*(as:\s*"part")?/g)) (m[2] ? parts : slots).add(m[1]);
}
let misKeyed = 0;
for (const file of styleChecked) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    for (const m of line.matchAll(/data-slot=["']?([a-z0-9-]+)/g)) {
      const name = m[1];
      if (parts.has(name) && !slots.has(name)) {
        console.log(`${relative(cwd, file)}:${index + 1}  [data-slot=${name}] never matches: ${name} is a part; select it as [data-part=${name}]`);
        misKeyed += 1;
      }
    }
  });
}
console.log(`${misKeyed} selectors keyed on the wrong attribute in ${styleChecked.size} source files`);
process.exitCode = refused + misKeyed > 0 ? 1 : 0;
