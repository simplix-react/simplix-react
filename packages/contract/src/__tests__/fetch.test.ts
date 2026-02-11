import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defaultFetch, ApiError } from "../helpers/fetch.js";

describe("ApiError", () => {
  it("constructs with status and body", () => {
    const error = new ApiError(404, "Not Found");
    expect(error.status).toBe(404);
    expect(error.body).toBe("Not Found");
    expect(error.message).toBe("API Error 404: Not Found");
    expect(error.name).toBe("ApiError");
  });

  it("is an instance of Error", () => {
    const error = new ApiError(500, "Internal Server Error");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it("works with instanceof check in catch block", () => {
    try {
      throw new ApiError(403, "Forbidden");
    } catch (e) {
      expect(e instanceof ApiError).toBe(true);
      if (e instanceof ApiError) {
        expect(e.status).toBe(403);
        expect(e.body).toBe("Forbidden");
      }
    }
  });
});

describe("defaultFetch", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not send Content-Type header for GET requests", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "result" }),
    });

    await defaultFetch("/api/test");

    expect(fetchMock).toHaveBeenCalledWith("/api/test", {
      headers: {},
    });
  });

  it("sends JSON Content-Type header for POST requests", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "result" }),
    });

    await defaultFetch("/api/test", { method: "POST", body: "{}" });

    expect(fetchMock).toHaveBeenCalledWith("/api/test", {
      method: "POST",
      body: "{}",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("allows overriding Content-Type header", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "result" }),
    });

    await defaultFetch("/api/test", {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/test", {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
    });
  });

  it("unwraps { data: T } envelope from response", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { id: "1", name: "Test" } }),
    });

    const result = await defaultFetch("/api/items/1");
    expect(result).toEqual({ id: "1", name: "Test" });
  });

  it("returns raw JSON when no data envelope exists", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "1", name: "Test" }),
    });

    const result = await defaultFetch("/api/items/1");
    expect(result).toEqual({ id: "1", name: "Test" });
  });

  it("returns undefined for 204 No Content", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
    });

    const result = await defaultFetch("/api/items/1");
    expect(result).toBeUndefined();
  });

  it("throws ApiError for non-2xx responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Not Found"),
    });

    await expect(defaultFetch("/api/items/missing")).rejects.toThrow(ApiError);
    await expect(defaultFetch("/api/items/missing")).rejects.toMatchObject({
      status: 404,
      body: "Not Found",
    });
  });

  it("throws ApiError for 500 error", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    try {
      await defaultFetch("/api/broken");
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(500);
    }
  });

  it("forwards request options to fetch", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    await defaultFetch("/api/items", {
      method: "POST",
      body: JSON.stringify({ title: "New item" }),
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/items", {
      method: "POST",
      body: JSON.stringify({ title: "New item" }),
      headers: { "Content-Type": "application/json" },
    });
  });

  it("handles data envelope with data: null (data exists but is null-ish)", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: null }),
    });

    const result = await defaultFetch("/api/items/1");
    // null is not undefined, so data envelope is unwrapped
    expect(result).toBeNull();
  });

  it("handles data envelope with data: 0", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 0 }),
    });

    const result = await defaultFetch("/api/count");
    expect(result).toBe(0);
  });

  it("handles data envelope with data: false", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: false }),
    });

    const result = await defaultFetch("/api/flag");
    expect(result).toBe(false);
  });

  it("handles data envelope with data: ''", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "" }),
    });

    const result = await defaultFetch("/api/value");
    expect(result).toBe("");
  });
});
