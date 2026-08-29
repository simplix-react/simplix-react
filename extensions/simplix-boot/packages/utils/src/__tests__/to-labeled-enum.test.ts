import { describe, expect, it } from "vitest";
import { resolveBootEnum } from "../resolve-boot-enum.js";
import { toLabeledEnum } from "../to-labeled-enum.js";

type Status = "ACTIVE" | "RETIRED";

describe("toLabeledEnum", () => {
  it("builds the shape a response carries, with the value as its own label", () => {
    expect(toLabeledEnum<Status>("ACTIVE")).toEqual({ value: "ACTIVE", label: "ACTIVE" });
  });

  it("round-trips through resolveBootEnum, which is the pair's whole point", () => {
    expect(resolveBootEnum(toLabeledEnum<Status>("RETIRED"))).toBe("RETIRED");
  });

  it("leaves an absent value absent, so an optional field stays unset", () => {
    expect(toLabeledEnum<Status>(undefined)).toBeUndefined();
  });
});
