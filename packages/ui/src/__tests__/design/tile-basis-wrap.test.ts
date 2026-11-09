import { describe, expect, it } from "vitest";

import clarityCss from "../../design/clarity-stylesheet";
import { declarationsOf } from "../helpers/contrast";

/**
 * A figure tile's basis line breaks at spaces in Korean.
 *
 * <p>Korean has no word boundary a line breaker can see, so a sentence in a narrow tile is broken
 * after any syllable and a word is split across two lines. `word-break: keep-all` moves the break
 * to the spaces. Only the compiled design carries it, so the check reads the compiled rules and not
 * the source table.
 */

/** The values `word-break` takes in the rules that name the slot. */
function wordBreaksOf(slot: string): string[] {
  return declarationsOf(clarityCss, `[data-slot="${slot}"]`)
    .map((rule) => rule.get("word-break"))
    .filter((value): value is string => value !== undefined);
}

describe("tile basis wrapping", () => {
  it("keeps a Korean basis line from breaking inside a word", () => {
    expect(wordBreaksOf("stat-card-description")).toContain("keep-all");
  });

  it("does not give the same rule to a slot that has none", () => {
    expect(wordBreaksOf("stat-card-unit")).not.toContain("keep-all");
  });
});
