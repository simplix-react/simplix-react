import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { EMPTY_VALUE_TEXT } from "../../index";

/** The refused character, spelled as a code point so this file holds it in no form a reader sees as the dash. */
const EM_DASH = String.fromCodePoint(0x2014);

const packagesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

/** Every message catalog the framework ships: `packages/<name>/src/locales/<locale>.json`. */
function catalogs(): string[] {
  return readdirSync(packagesDir)
    .map((name) => join(packagesDir, name, "src", "locales"))
    .filter((dir) => {
      try {
        return statSync(dir).isDirectory();
      } catch {
        return false;
      }
    })
    .flatMap((dir) => readdirSync(dir).filter((file) => file.endsWith(".json")).map((file) => join(dir, file)));
}

/** Flattens a catalog into `dotted.key: text` pairs. */
function entries(node: unknown, prefix = ""): [string, string][] {
  if (typeof node === "string") return [[prefix, node]];
  if (node && typeof node === "object") {
    return Object.entries(node).flatMap(([key, value]) => entries(value, prefix ? `${prefix}.${key}` : key));
  }
  return [];
}

describe("the framework's message catalogs", () => {
  const files = catalogs();

  it("are found, so the scan below cannot pass over nothing", () => {
    expect(files.length).toBeGreaterThanOrEqual(6);
  });

  it("hold no em dash in any message, in any locale", () => {
    const hits = files.flatMap((file) =>
      entries(JSON.parse(readFileSync(file, "utf-8")))
        .filter(([, text]) => text.includes(EM_DASH))
        .map(([key]) => `${relative(packagesDir, file)} ${key}`),
    );
    expect(hits).toEqual([]);
  });

  it("write an unknown total with the shared empty mark", () => {
    for (const locale of ["en", "ko", "ja"]) {
      const catalog = JSON.parse(readFileSync(join(packagesDir, "ui", "src", "locales", `${locale}.json`), "utf-8")) as { list: { totalCountUnknown: string } };
      expect(catalog.list.totalCountUnknown).toContain(EMPTY_VALUE_TEXT);
    }
  });
});
