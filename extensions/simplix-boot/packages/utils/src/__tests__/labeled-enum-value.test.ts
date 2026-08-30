import { describe, expect, it } from "vitest";
import { resolveBootEnum } from "../resolve-boot-enum.js";
import type { LabeledEnumValue } from "../labeled-enum-value.js";

type Status = "ACTIVE" | "RETIRED";

describe("LabeledEnumValue", () => {
  it("resolves to the value the server put in `value`", () => {
    const status: LabeledEnumValue<Status> = { value: "ACTIVE", label: "활성" };
    expect(resolveBootEnum(status)).toBe("ACTIVE");
  });

  it("still round-trips a bare string, which is the other shape the wire carries", () => {
    expect(resolveBootEnum("RETIRED")).toBe("RETIRED");
  });

  it("narrows `value` to the union, so a wrong member is a type error not a runtime surprise", () => {
    const status: LabeledEnumValue<Status> = { value: "RETIRED", label: "폐기" };
    // @ts-expect-error "PENDING" is not a member of Status
    const wrong: LabeledEnumValue<Status> = { value: "PENDING", label: "대기" };
    expect(status.value).toBe("RETIRED");
    expect(resolveBootEnum(wrong)).toBe("PENDING");
  });
});
