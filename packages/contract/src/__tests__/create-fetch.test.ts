import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createFetch } from "../helpers/create-fetch.js";
import { ApiError } from "../helpers/fetch.js";

describe("createFetch", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns raw JSON when no options provided", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "1", name: "Test" }),
    });

    const fetchFn = createFetch();
    const result = await fetchFn("/api/items/1");
    expect(result).toEqual({ id: "1", name: "Test" });
  });

  it("applies custom transformResponse", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ body: { id: "1" }, meta: {} }),
    });

    const fetchFn = createFetch({
      transformResponse: (json) => (json as { body: unknown }).body ?? json,
    });

    const result = await fetchFn("/api/items/1");
    expect(result).toEqual({ id: "1" });
  });

  it("passes correct path and method context to transformResponse", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "value" }),
    });

    const transformResponse = vi.fn((json) => json);
    const fetchFn = createFetch({ transformResponse });

    await fetchFn("/api/items", { method: "POST", body: "{}" });

    expect(transformResponse).toHaveBeenCalledWith(
      { data: "value" },
      { path: "/api/items", method: "POST" },
    );
  });

  it("supports path-based branching in transformResponse", async () => {
    const fetchFn = createFetch({
      transformResponse: (json, { path }) => {
        if (path.includes("/oauth/token"))
          return (json as { data: unknown }).data ?? json;
        return (json as { body: unknown }).body ?? json;
      },
    });

    // OAuth endpoint — unwrap data
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { token: "abc" } }),
    });
    const oauthResult = await fetchFn("/oauth/token");
    expect(oauthResult).toEqual({ token: "abc" });

    // Regular endpoint — unwrap body
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ body: { id: "1" } }),
    });
    const regularResult = await fetchFn("/api/items/1");
    expect(regularResult).toEqual({ id: "1" });
  });

  it("returns undefined for 204 without calling transformResponse", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
    });

    const transformResponse = vi.fn();
    const fetchFn = createFetch({ transformResponse });

    const result = await fetchFn("/api/items/1", { method: "DELETE" });
    expect(result).toBeUndefined();
    expect(transformResponse).not.toHaveBeenCalled();
  });

  it("throws ApiError for non-2xx without calling transformResponse", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Not Found"),
    });

    const transformResponse = vi.fn();
    const fetchFn = createFetch({ transformResponse });

    await expect(fetchFn("/api/items/missing")).rejects.toThrow(ApiError);
    await expect(fetchFn("/api/items/missing")).rejects.toMatchObject({
      status: 404,
      body: "Not Found",
    });
    expect(transformResponse).not.toHaveBeenCalled();
  });

  it("sets Content-Type for POST/PUT/PATCH, not for GET", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const fetchFn = createFetch();

    await fetchFn("/api/test");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/test", {
      headers: {},
    });

    await fetchFn("/api/test", { method: "POST", body: "{}" });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/test", {
      method: "POST",
      body: "{}",
      headers: { "Content-Type": "application/json" },
    });

    await fetchFn("/api/test", { method: "PUT", body: "{}" });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/test", {
      method: "PUT",
      body: "{}",
      headers: { "Content-Type": "application/json" },
    });

    await fetchFn("/api/test", { method: "PATCH", body: "{}" });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/test", {
      method: "PATCH",
      body: "{}",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("allows header overrides", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const fetchFn = createFetch();

    await fetchFn("/api/test", {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/test", {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
    });
  });

  it("defaults method to GET when not specified", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ value: 42 }),
    });

    const transformResponse = vi.fn((json) => json);
    const fetchFn = createFetch({ transformResponse });

    await fetchFn("/api/test");

    expect(transformResponse).toHaveBeenCalledWith(
      { value: 42 },
      { path: "/api/test", method: "GET" },
    );
  });

  describe("onError", () => {
    it("calls onError with parsed JSON body on non-2xx response", async () => {
      const errorBody = { errorCode: "NOT_FOUND", message: "Item not found" };
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify(errorBody)),
      });

      const onError = vi.fn();
      const fetchFn = createFetch({ onError });

      await expect(fetchFn("/api/items/1")).rejects.toThrow(ApiError);

      expect(onError).toHaveBeenCalledWith({
        status: 404,
        body: errorBody,
        path: "/api/items/1",
        method: "GET",
      });
    });

    it("uses raw text when response body is not JSON", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      const onError = vi.fn();
      const fetchFn = createFetch({ onError });

      await expect(fetchFn("/api/broken")).rejects.toThrow(ApiError);

      expect(onError).toHaveBeenCalledWith({
        status: 500,
        body: "Internal Server Error",
        path: "/api/broken",
        method: "GET",
      });
    });

    it("propagates custom error thrown by onError", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ errorCode: "VALIDATION" })),
      });

      class CustomError extends Error {
        constructor(public code: string) {
          super(code);
        }
      }

      const fetchFn = createFetch({
        onError: ({ body }) => {
          const env = body as { errorCode?: string };
          if (env.errorCode) throw new CustomError(env.errorCode);
        },
      });

      await expect(fetchFn("/api/items")).rejects.toThrow(CustomError);
      await expect(fetchFn("/api/items")).rejects.toMatchObject({
        code: "VALIDATION",
      });
    });

    it("falls through to ApiError when onError does not throw", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 422,
        text: () => Promise.resolve("Unprocessable"),
      });

      const onError = vi.fn(); // does not throw
      const fetchFn = createFetch({ onError });

      await expect(fetchFn("/api/items")).rejects.toThrow(ApiError);
      await expect(fetchFn("/api/items")).rejects.toMatchObject({
        status: 422,
      });
    });
  });
});
