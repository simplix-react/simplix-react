import { describe, it, expect } from "vitest";
import { apiKeyScheme } from "../schemes/api-key-scheme.js";

describe("apiKeyScheme", () => {
  describe("header mode", () => {
    it("returns the API key as a header with the given name", async () => {
      const scheme = apiKeyScheme({
        in: "header",
        name: "X-API-Key",
        key: "sk-abc123",
      });

      const headers = await scheme.getHeaders();
      expect(headers).toEqual({ "X-API-Key": "sk-abc123" });
    });

    it("supports custom header names", async () => {
      const scheme = apiKeyScheme({
        in: "header",
        name: "Authorization",
        key: "ApiKey my-key",
      });

      const headers = await scheme.getHeaders();
      expect(headers).toEqual({ Authorization: "ApiKey my-key" });
    });

    it("returns empty headers when key function returns null", async () => {
      const scheme = apiKeyScheme({
        in: "header",
        name: "X-API-Key",
        key: () => null,
      });

      const headers = await scheme.getHeaders();
      expect(headers).toEqual({});
    });
  });

  describe("query mode", () => {
    it("returns key as X-Auth-Query-Params header", async () => {
      const scheme = apiKeyScheme({
        in: "query",
        name: "api_key",
        key: "my-key",
      });

      const headers = await scheme.getHeaders();
      expect(headers).toEqual({
        "X-Auth-Query-Params": "api_key=my-key",
      });
    });

    it("URL-encodes the key value", async () => {
      const scheme = apiKeyScheme({
        in: "query",
        name: "key",
        key: "has spaces&special=chars",
      });

      const headers = await scheme.getHeaders();
      expect(headers["X-Auth-Query-Params"]).toBe(
        `key=${encodeURIComponent("has spaces&special=chars")}`,
      );
    });

    it("returns empty headers when key function returns null in query mode", async () => {
      const scheme = apiKeyScheme({
        in: "query",
        name: "api_key",
        key: () => null,
      });

      const headers = await scheme.getHeaders();
      expect(headers).toEqual({});
    });
  });

  describe("function key", () => {
    it("resolves key from a function", async () => {
      let currentKey: string | null = "initial-key";
      const scheme = apiKeyScheme({
        in: "header",
        name: "X-API-Key",
        key: () => currentKey,
      });

      expect(await scheme.getHeaders()).toEqual({ "X-API-Key": "initial-key" });

      currentKey = "updated-key";
      expect(await scheme.getHeaders()).toEqual({ "X-API-Key": "updated-key" });
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when static key is provided", () => {
      const scheme = apiKeyScheme({
        in: "header",
        name: "X-API-Key",
        key: "my-key",
      });
      expect(scheme.isAuthenticated()).toBe(true);
    });

    it("returns false when function key returns null", () => {
      const scheme = apiKeyScheme({
        in: "header",
        name: "X-API-Key",
        key: () => null,
      });
      expect(scheme.isAuthenticated()).toBe(false);
    });

    it("returns true when function key returns a value", () => {
      const scheme = apiKeyScheme({
        in: "header",
        name: "X-API-Key",
        key: () => "has-key",
      });
      expect(scheme.isAuthenticated()).toBe(true);
    });
  });

  describe("clear", () => {
    it("does not throw (API keys are typically static)", () => {
      const scheme = apiKeyScheme({
        in: "header",
        name: "X-API-Key",
        key: "static",
      });
      expect(() => scheme.clear()).not.toThrow();
    });
  });

  describe("name", () => {
    it("has the name 'api-key'", () => {
      const scheme = apiKeyScheme({
        in: "header",
        name: "X-API-Key",
        key: "k",
      });
      expect(scheme.name).toBe("api-key");
    });
  });
});
