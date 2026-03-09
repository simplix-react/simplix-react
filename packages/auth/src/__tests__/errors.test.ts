import { describe, it, expect } from "vitest";
import { AuthError } from "../errors.js";
import type { AuthErrorCode } from "../errors.js";

describe("AuthError", () => {
  it("creates an error with code and message", () => {
    const error = new AuthError("TOKEN_EXPIRED", "Token has expired");

    expect(error.code).toBe("TOKEN_EXPIRED");
    expect(error.message).toBe("Token has expired");
  });

  it("has name set to AuthError", () => {
    const error = new AuthError("UNAUTHENTICATED", "Not authenticated");

    expect(error.name).toBe("AuthError");
  });

  it("is an instance of Error", () => {
    const error = new AuthError("SCHEME_ERROR", "Something went wrong");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
  });

  it("supports cause option", () => {
    const cause = new TypeError("original error");
    const error = new AuthError("REFRESH_FAILED", "Refresh failed", {
      cause,
    });

    expect(error.cause).toBe(cause);
  });

  it("works without cause option", () => {
    const error = new AuthError("TOKEN_EXPIRED", "Expired");

    expect(error.cause).toBeUndefined();
  });

  it("supports all error codes", () => {
    const codes: AuthErrorCode[] = [
      "TOKEN_EXPIRED",
      "REFRESH_FAILED",
      "UNAUTHENTICATED",
      "SCHEME_ERROR",
    ];

    for (const code of codes) {
      const error = new AuthError(code, `Error: ${code}`);
      expect(error.code).toBe(code);
    }
  });

  it("can be caught with instanceof check", () => {
    try {
      throw new AuthError("REFRESH_FAILED", "Refresh failed");
    } catch (error) {
      expect(error instanceof AuthError).toBe(true);
      if (error instanceof AuthError) {
        expect(error.code).toBe("REFRESH_FAILED");
      }
    }
  });

  it("has a proper stack trace", () => {
    const error = new AuthError("SCHEME_ERROR", "test");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("AuthError");
  });
});
