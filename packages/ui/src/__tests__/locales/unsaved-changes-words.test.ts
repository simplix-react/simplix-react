import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const localesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "locales");

/** The `common` section of one shipped catalog. */
function common(locale: string): Record<string, string> {
  return (JSON.parse(readFileSync(join(localesDir, `${locale}.json`), "utf8")) as { common: Record<string, string> }).common;
}

/**
 * The unsaved-changes dialog is shown over a form, a dialog and a page, so its words name the
 * changes and the act of throwing them away, never the page the reader is on.
 */
describe("the unsaved-changes dialog's Korean words", () => {
  const ko = common("ko");

  it("names the discarding on the button, as the English does, and not a leaving", () => {
    expect(ko.discard).toBe("버리기");
    expect(ko.discard).not.toContain("나가");
  });

  it("asks about the changes and says nothing of a page, since a form and a dialog are no page", () => {
    expect(ko.unsavedDescription).toContain("변경사항");
    expect(ko.unsavedDescription).toContain("버리시겠습니까");
    expect(ko.unsavedDescription).not.toContain("페이지");
    expect(ko.unsavedDescription).not.toContain("나가");
  });

  it("is present in every shipped language, so none falls back to a key", () => {
    for (const locale of ["en", "ko", "ja"]) {
      const words = common(locale);
      expect(words.discard, locale).toBeTruthy();
      expect(words.unsavedTitle, locale).toBeTruthy();
      expect(words.unsavedDescription, locale).toBeTruthy();
    }
  });
});
