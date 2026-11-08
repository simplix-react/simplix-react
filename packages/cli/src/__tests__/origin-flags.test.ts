import { describe, expect, it } from "vitest";

import { describeDisagreement, screenOfOrigin, unifyOrigins } from "../utils/origin-flags.js";

const files = (...origins: string[]) => origins.map((origin, at) => ({ path: `f${at}.tsx`, origin }));

describe("the screen an origin lays down", () => {
  it("is the command, its words and the flags that place it, whatever decisions follow", () => {
    expect(screenOfOrigin("scaffold plan --module admin/billing --list-presentation cards --status-badge kind")).toBe("scaffold plan --module admin/billing");
    expect(screenOfOrigin("scaffold plan --output src/widgets")).toBe("scaffold plan --output src/widgets");
    expect(screenOfOrigin("add-page static-page about --app web --variant wide")).toBe("add-page static-page about --app web");
  });
});

describe("origins made to agree per screen", () => {
  it("leaves a screen whose files record one origin alone", () => {
    const { unified, disagreements } = unifyOrigins(files("scaffold plan --module m", "scaffold plan --module m"));
    expect(unified.size).toBe(0);
    expect(disagreements).toEqual([]);
  });

  it("takes a decision some files record into every file of the screen", () => {
    const plain = "scaffold plan --module admin/billing --list-presentation cards --card-title name";
    const badged = `${plain} --status-badge kind`;
    const { unified, disagreements } = unifyOrigins(files(plain, badged, plain));
    expect(unified.get(plain)).toBe(badged);
    expect(unified.get(badged)).toBe(badged);
    expect(disagreements).toHaveLength(1);
    expect(disagreements[0]).toMatchObject({ screen: "scaffold plan --module admin/billing", flag: "--status-badge", kind: "missing", chosen: "kind" });
    expect(disagreements[0].recorded).toEqual([
      { value: "kind", files: ["f1.tsx"] },
      { value: null, files: ["f0.tsx", "f2.tsx"] },
    ]);
  });

  it("keeps the flags of the richest origin in their order and appends the ones only another records", () => {
    const { unified } = unifyOrigins(files("scaffold e --module m --view-toggle --card-title a", "scaffold e --module m --menu-group g"));
    expect(unified.get("scaffold e --module m --menu-group g")).toBe("scaffold e --module m --view-toggle --card-title a --menu-group g");
  });

  it("takes a flag that has no value as it is", () => {
    const { unified } = unifyOrigins(files("scaffold e --module m", "scaffold e --module m --view-toggle"));
    expect(unified.get("scaffold e --module m")).toBe("scaffold e --module m --view-toggle");
  });

  it("reports two values for one decision as a conflict and takes the one most files record", () => {
    const a = "scaffold e --module m --status-badge kind";
    const b = "scaffold e --module m --status-badge outcome";
    const { unified, disagreements } = unifyOrigins(files(a, b, b));
    expect(unified.get(a)).toBe(b);
    expect(disagreements[0]).toMatchObject({ kind: "conflict", flag: "--status-badge", chosen: "outcome" });
    expect(describeDisagreement(disagreements[0])).toMatch(/files disagree on --status-badge: .*--status-badge kind in 1 file\(s\).*--status-badge outcome in 2 file\(s\).*refused/);
  });

  it("breaks a tie between two values by name, so the choice does not depend on file order", () => {
    const a = "scaffold e --module m --status-badge kind";
    const b = "scaffold e --module m --status-badge outcome";
    expect(unifyOrigins(files(a, b)).unified.get(a)).toBe(a);
    expect(unifyOrigins(files(b, a)).unified.get(a)).toBe(a);
  });

  it("keeps two screens of one entity apart when they are placed apart", () => {
    const { unified } = unifyOrigins(files("scaffold e --module a --status-badge x", "scaffold e --module b", "scaffold e --module b"));
    expect(unified.size).toBe(0);
  });

  it("describes a flag only some files record as rendered into all of them", () => {
    const { disagreements } = unifyOrigins(files("scaffold e --module m", "scaffold e --module m --status-badge kind"));
    expect(describeDisagreement(disagreements[0])).toMatch(/no such flag in 1 file\(s\) \(f0\.tsx\).*renders every file of the screen with --status-badge kind/);
  });
});
