import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Every control this package draws says where the keyboard is.
 *
 * <p>A style that writes `outline-none` takes away the one focus indicator the browser gives for
 * free, and nothing errors when it puts nothing back — the component renders, every test passes,
 * and the only reader who loses anything is the one who cannot use a mouse. It went unnoticed on
 * the whole `Button` recipe, every variant and every size, until somebody pressed Tab inside a
 * drawer and could not tell what was selected.
 *
 * <p><b>The exemption is a comment, not a list here.</b> Three shapes take the outline away and are
 * right to — a container the library moves focus into, an inner field whose box shows focus for it,
 * and an option row the cursor points at with a background. Each one says so beside the style,
 * naming `outline-none`, so the reason sits where the next person changing that line will read it.
 * A list in this file would go stale the moment a component moved.
 */

/** Taking the browser's focus ring away. */
const STRIPS_FOCUS = /(?:focus-visible:|focus:|focus-within:)?outline-none/;

/** Anything the eye can see change when focus lands: a ring, a border, a fill, a colour, a shadow. */
const SHOWS_FOCUS =
  /(?:focus|focus-visible|focus-within)[^\s"']*:(?:ring|border|bg-|text-|shadow|outline-(?!none))|data-\[(?:highlighted|selected=true|state=open)\][^\s"']*:(?:bg-|ring|border|text-)/;

/** A comment that names what it is exempting, which is what makes it an argument. */
const DECLARED = /\/\/[^\n]*outline-none/;

/**
 * How far above a class string the declaring comment may sit. A `cva(` recipe has room for the
 * comment inside it; a `className="…"` attribute has none, so the argument goes on the lines just
 * above and this is what reaches it.
 */
const LINES_ABOVE = 6;

/** Every source file this package ships. */
function sources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== "__tests__") sources(path, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}

/**
 * Each class string in a file, as the text from `cva(` or `className=` to its close.
 *
 * <p>Read by balancing brackets rather than by taking a line: a recipe runs to twenty lines and the
 * ring is as often on the fourth as on the first, so a line-at-a-time reader calls half of them
 * bare.
 */
function classRegions(text: string): { region: string; line: number }[] {
  const out: { region: string; line: number }[] = [];
  for (const opened of text.matchAll(/cva\(|className=\{|className="/g)) {
    const at = opened.index ?? 0;
    let cursor = at + opened[0].length - 1;
    let end = cursor;
    if (opened[0] === 'className="') {
      end = text.indexOf('"', cursor + 1) + 1;
    } else {
      let depth = 0;
      for (end = cursor; end < text.length; end += 1) {
        const character = text[end];
        if ("([{".includes(character)) depth += 1;
        else if (")]}".includes(character)) {
          depth -= 1;
          if (depth === 0) {
            end += 1;
            break;
          }
        }
      }
    }
    const before = text.slice(0, at).split("\n");
    out.push({
      region: before.slice(-LINES_ABOVE).join("\n") + text.slice(at, end),
      line: before.length,
    });
  }
  return out;
}

describe("focus is visible wherever the browser's outline is taken away", () => {
  it("every style that writes outline-none either shows focus another way or says why not", () => {
    const bare: string[] = [];
    for (const file of sources("src")) {
      const text = readFileSync(file, "utf8");
      for (const { region, line } of classRegions(text)) {
        if (!STRIPS_FOCUS.test(region)) continue;
        if (SHOWS_FOCUS.test(region) || DECLARED.test(region)) continue;
        bare.push(`${file}:${line}`);
      }
    }
    expect(bare).toEqual([]);
  });
});
