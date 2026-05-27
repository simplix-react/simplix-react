import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zodToFieldErrors } from "../utils/zod-field-errors.js";

describe("zodToFieldErrors", () => {
  // Z1 — success returns null
  it("returns null when safeParse succeeds", () => {
    const schema = z.object({ name: z.string().min(1) });
    expect(zodToFieldErrors(schema, { name: "ok" })).toBeNull();
  });

  // Z2 — single field, single issue
  it("maps a single field issue to { field: message }", () => {
    const schema = z.object({ name: z.string().min(1, "name required") });
    const result = zodToFieldErrors(schema, { name: "" });

    expect(result).toEqual({ name: "name required" });
  });

  // Z3 — single field with multiple issues → first message wins
  it("keeps only the FIRST message when a field has multiple issues", () => {
    const schema = z.object({
      name: z.string().superRefine((_val, ctx) => {
        ctx.addIssue({ code: "custom", message: "first issue" });
        ctx.addIssue({ code: "custom", message: "second issue" });
      }),
    });
    const result = zodToFieldErrors(schema, { name: "anything" });

    expect(result).toEqual({ name: "first issue" });
  });

  // Z4 — multiple fields each with one issue
  it("maps multiple field issues independently", () => {
    const schema = z.object({
      name: z.string().min(1, "name required"),
      email: z.string().email("invalid email"),
    });
    const result = zodToFieldErrors(schema, { name: "", email: "not-an-email" });

    expect(result).toEqual({
      name: "name required",
      email: "invalid email",
    });
  });

  // Z5 — nested object path → dot.joined key
  it("dot-joins nested object paths", () => {
    const schema = z.object({
      profile: z.object({
        phone: z.string().min(1, "phone required"),
      }),
    });
    const result = zodToFieldErrors(schema, { profile: { phone: "" } });

    expect(result).toEqual({ "profile.phone": "phone required" });
  });

  // Z6 — array index path → "items.0.name"
  it("dot-joins array index paths", () => {
    const schema = z.object({
      items: z.array(
        z.object({ name: z.string().min(1, "item name required") }),
      ),
    });
    const result = zodToFieldErrors(schema, {
      items: [{ name: "ok" }, { name: "" }],
    });

    expect(result).toEqual({ "items.1.name": "item name required" });
  });

  // Z7 — refined schema messages flow through
  it("propagates messages from a refined schema", () => {
    const schema = z
      .object({
        password: z.string().min(8),
        confirm: z.string(),
      })
      .refine((v) => v.password === v.confirm, {
        message: "passwords do not match",
        path: ["confirm"],
      });
    const result = zodToFieldErrors(schema, {
      password: "abcdefgh",
      confirm: "xyz",
    });

    expect(result).toEqual({ confirm: "passwords do not match" });
  });
});
