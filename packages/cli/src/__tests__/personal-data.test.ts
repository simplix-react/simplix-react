import { describe, expect, it } from "vitest";

import { withUnmaskedFlagged } from "../meta/personal-data.js";

const record = [{ name: "subject" }, { name: "recipientEmail" }, { name: "recipientEmailMasked" }, { name: "senderEmail" }];

describe("withUnmaskedFlagged", () => {
  it("flags a field whose masked twin the record also carries", () => {
    const out = withUnmaskedFlagged(record, "Masked");
    expect(out.filter((one) => "isUnmasked" in one).map((one) => one.name)).toEqual(["recipientEmail"]);
  });
  it("leaves the masked twin and the fields with none unflagged", () => {
    const out = withUnmaskedFlagged(record, "Masked");
    expect(out.find((one) => one.name === "recipientEmailMasked")).toEqual({ name: "recipientEmailMasked" });
    expect(out.find((one) => one.name === "senderEmail")).toEqual({ name: "senderEmail" });
  });
  it("flags nothing when the project names no suffix", () => {
    expect(withUnmaskedFlagged(record, undefined)).toEqual(record);
    expect(withUnmaskedFlagged(record, "")).toEqual(record);
  });
  it("flags nothing when the suffix matches no field", () => {
    expect(withUnmaskedFlagged(record, "Hidden")).toEqual(record);
  });
});
