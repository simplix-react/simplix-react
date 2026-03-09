import { describe, it, expect } from "vitest";
import { AccessDeniedError } from "../errors.js";

describe("AccessDeniedError", () => {
  it("sets the correct message format", () => {
    const error = new AccessDeniedError("delete", "Pet");

    expect(error.message).toBe('Access denied: cannot "delete" on "Pet"');
  });

  it("stores action and subject as readonly properties", () => {
    const error = new AccessDeniedError("edit", "Order");

    expect(error.action).toBe("edit");
    expect(error.subject).toBe("Order");
  });

  it("sets name to AccessDeniedError", () => {
    const error = new AccessDeniedError("view", "User");

    expect(error.name).toBe("AccessDeniedError");
  });

  it("is an instance of Error", () => {
    const error = new AccessDeniedError("create", "Pet");

    expect(error).toBeInstanceOf(Error);
  });

  it("is an instance of AccessDeniedError", () => {
    const error = new AccessDeniedError("manage", "all");

    expect(error).toBeInstanceOf(AccessDeniedError);
  });

  it("can be distinguished from generic errors via instanceof", () => {
    const errors: Error[] = [
      new Error("generic"),
      new AccessDeniedError("view", "Pet"),
    ];

    const accessErrors = errors.filter(
      (e) => e instanceof AccessDeniedError,
    );

    expect(accessErrors).toHaveLength(1);
    expect((accessErrors[0] as AccessDeniedError).action).toBe("view");
  });
});
