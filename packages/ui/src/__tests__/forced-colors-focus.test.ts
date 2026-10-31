import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { sourceFiles } from "./helpers/source-files";

/**
 * Under forced colors (Windows High Contrast) the keyboard is still visible.
 *
 * <p>Forced colors replaces backgrounds with system colours and drops box-shadow, so a focus style
 * drawn as a tint, a ring or a halo disappears, and a slot that removed the outline for it leaves
 * nothing. One base rule in `theme/base.css` draws an outline on every focused element; this file
 * holds that rule to what makes it reach all of them:
 *
 * <ol>
 *   <li>it exists, in a system colour, and says `!important`;
 *   <li>it sits outside every cascade layer, and `theme.css` imports it, so a consumer that takes
 *       the theme takes the rule;
 *   <li>nothing this package ships declares an outline `!important` of its own, which is the only
 *       thing a declaration of the rule's weight could lose to.
 * </ol>
 *
 * <p>The third is what stands in for a census of the slots that strip the outline: a slot
 * declaration is a normal declaration, so it cannot win over an important one, however many of them
 * there are and whichever layer or selector they use.
 */

/** This package's `src`, resolved from this file rather than from the working directory. */
const SRC = fileURLToPath(new URL("..", import.meta.url));

/** A system colour: the one a user's own palette decides, never a value the author picked. */
const SYSTEM_OUTLINE = /^(\d+)px solid (Highlight|CanvasText)\s*!important$/;

interface Block {
  /** What precedes the braces: a selector list or an at-rule head. */
  readonly head: string;
  /** What is inside the braces, untouched. */
  readonly body: string;
}

/** The text with block comments removed, so a comment that mentions a rule is not read as one. */
function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * The blocks at the top nesting level of `css`.
 *
 * <p>Read by balancing braces, which is all the structure this check needs: the question is which
 * rule sits where, and a parser that understood more would still be asked that.
 */
function blocksOf(css: string): Block[] {
  const out: Block[] = [];
  let depth = 0;
  let headStart = 0;
  let bodyStart = 0;
  for (let at = 0; at < css.length; at += 1) {
    const character = css[at];
    if (character === "{") {
      if (depth === 0) bodyStart = at + 1;
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        out.push({ head: css.slice(headStart, bodyStart - 1).trim(), body: css.slice(bodyStart, at) });
        headStart = at + 1;
      }
    } else if (character === ";" && depth === 0) {
      headStart = at + 1;
    }
  }
  return out;
}

/** The selector list of a rule, one selector per entry, whitespace collapsed. */
function selectorsOf(head: string): string[] {
  return head.split(",").map((selector) => selector.replace(/\s+/g, " ").trim());
}

/** The value of `property` in a declaration block, or `undefined` when it is not declared. */
function declaredValue(body: string, property: string): string | undefined {
  const found = body.match(new RegExp(`(?:^|[;\\s])${property}\\s*:\\s*([^;]+)`));
  return found?.[1].replace(/\s+/g, " ").trim();
}

/** The forced-colors block at the top level of the theme, which is outside every `@layer`. */
function forcedColorsBlock(css: string): Block | undefined {
  return blocksOf(withoutComments(css)).find((block) => /^@media\s*\(\s*forced-colors\s*:\s*active\s*\)$/.test(block.head));
}

/**
 * A class that makes the outline important: an outline utility with the important bang in front or
 * behind, with or without a variant before it, or an arbitrary outline property carrying the bang.
 */
const IMPORTANT_OUTLINE_CLASS =
  /(?<![\w-])(?:[\w[\]=&.:%()-]+:)*(?:!outline(?:-[\w[\]#%./()-]+)?|outline(?:-[\w[\]#%./()-]+)?!|\[outline[\w-]*:[^\]]*\]!|!\[outline[\w-]*:[^\]]*\])(?![\w-])/;

/** A stylesheet declaration of any outline property marked important. */
const IMPORTANT_OUTLINE_DECLARATION = /outline[\w-]*\s*:[^;}]*!important/;

/** The compiled clarity design: the stylesheet the page receives, decoded from its module. */
function compiledClarity(): string {
  const module = readFileSync(join(SRC, "design/clarity-stylesheet.ts"), "utf8");
  const encoded = module.match(/const encoded = "([^"]+)"/)?.[1];
  if (!encoded) throw new Error("clarity-stylesheet.ts no longer holds its stylesheet as `const encoded = \"...\"`");
  return Buffer.from(encoded, "base64").toString("utf8");
}

describe("focus is visible under forced colors", () => {
  const theme = readFileSync(join(SRC, "theme/base.css"), "utf8");
  const forced = forcedColorsBlock(theme);

  it("draws an important system-colour outline on every :focus-visible element", () => {
    expect(forced, "base.css has no top-level @media (forced-colors: active) block").toBeDefined();
    const rule = blocksOf(forced?.body ?? "").find((block) => selectorsOf(block.head).includes(":focus-visible"));
    expect(rule, "the forced-colors block has no :focus-visible rule").toBeDefined();
    const outline = declaredValue(rule?.body ?? "", "outline");
    expect(outline).toMatch(SYSTEM_OUTLINE);
    expect(Number(outline?.match(SYSTEM_OUTLINE)?.[1])).toBeGreaterThanOrEqual(2);
  });

  it("draws the same outline on a row that holds the cursor without holding focus", () => {
    const selectors = blocksOf(forced?.body ?? "").flatMap((block) =>
      declaredValue(block.body, "outline")?.endsWith("!important") ? selectorsOf(block.head) : [],
    );
    // A combobox option (the input keeps focus) and a command item (cmdk moves a data attribute).
    expect(selectors).toContain('[role="option"][data-highlighted]:not([data-highlighted="false"])');
    expect(selectors).toContain('[cmdk-item][data-selected="true"]');
  });

  it("is not inside a cascade layer, and the theme entry imports it", () => {
    expect(forced, "a rule inside @layer is not top-level, so the layered utilities that strip the outline win").toBeDefined();
    const entry = readFileSync(join(SRC, "theme.css"), "utf8");
    expect(entry).toMatch(/@import\s+["']\.\/theme\/base\.css["']/);
  });

  it("is not beaten by any outline this package declares", () => {
    const beaten: string[] = [];
    for (const file of sourceFiles(SRC, /\.(?:tsx?|css)$/)) {
      if (file.endsWith("clarity-stylesheet.ts")) continue;
      // The rule under test is the one important outline there should be, so its block is set aside.
      const text = file.endsWith(".css")
        ? withoutComments(readFileSync(file, "utf8")).replace(forced?.body ?? "\0", "")
        : readFileSync(file, "utf8");
      text.split("\n").forEach((line, index) => {
        if (/^\s*(?:\/\/|\*|\/\*)/.test(line)) return;
        if (IMPORTANT_OUTLINE_CLASS.test(line) || IMPORTANT_OUTLINE_DECLARATION.test(line)) {
          beaten.push(`${relative(SRC, file)}:${index + 1}`);
        }
      });
    }
    expect(beaten).toEqual([]);
    // The stylesheet the clarity design puts on the page is generated from the same declarations,
    // so it is read as shipped rather than assumed to follow them.
    expect(compiledClarity()).not.toMatch(IMPORTANT_OUTLINE_DECLARATION);
  });
});

describe("the patterns that look for an important outline", () => {
  // The examples are joined at run time. Tailwind reads every `.ts` file under this package as a
  // class source, so a whole important outline utility written out here would make it emit that
  // utility into the stylesheet of every app that consumes the package.
  const bang = "!";
  const none = "outline-none";
  const hits = [
    `focus-visible:${bang}${none}`,
    `${none}${bang}`,
    `${bang}outline-0`,
    `dark:focus-visible:outline-hidden${bang}`,
    `[outline:none]${bang}`,
    `outline: none ${bang}important;`,
    `outline-style: none${bang}important`,
  ];
  const misses = [
    `focus-visible:${none}`,
    "outline-offset-2",
    `focus-visible:border-[var(--ring)]${bang}`,
    `focus-visible:ring-0 shadow-none${bang}`,
    "outline: 2px solid Highlight;",
    `no-outline-here${bang}`,
  ];

  it.each(hits)("flags %s", (text) => {
    expect(IMPORTANT_OUTLINE_CLASS.test(text) || IMPORTANT_OUTLINE_DECLARATION.test(text)).toBe(true);
  });

  it.each(misses)("leaves %s alone", (text) => {
    expect(IMPORTANT_OUTLINE_CLASS.test(text) || IMPORTANT_OUTLINE_DECLARATION.test(text)).toBe(false);
  });

  it("reads a rule that is nested in a layer as not top-level", () => {
    const layered = "@layer base { @media (forced-colors: active) { :focus-visible { outline: 2px solid Highlight !important } } }";
    expect(forcedColorsBlock(layered)).toBeUndefined();
    const bare = "@media (forced-colors: active) { :focus-visible { outline: 2px solid Highlight !important } }";
    expect(forcedColorsBlock(bare)).toBeDefined();
  });
});
