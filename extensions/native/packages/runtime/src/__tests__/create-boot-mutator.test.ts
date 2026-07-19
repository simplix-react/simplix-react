import { HttpError, setRequestLocale } from "@simplix-react/api";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createNativeBootMutator } from "../mutator/create-boot-mutator";

function mockFetchOnce(status: number, body: unknown) {
  const response = {
    ok: status >= 200 && status < 300,
    status,
    statusText: `HTTP ${status}`,
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  };
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createNativeBootMutator", () => {
  it("unwraps the Boot envelope body on success", async () => {
    mockFetchOnce(200, {
      type: "SUCCESS",
      message: "ok",
      body: { id: "1", name: "Alpha" },
      timestamp: "2026-01-01T00:00:00Z",
    });
    const mutator = createNativeBootMutator({ baseUrl: "http://api.test" });

    const result = await mutator<{ id: string; name: string }>("/pets/1");

    expect(result).toEqual({ id: "1", name: "Alpha" });
  });

  it("prefixes the base URL and attaches the bearer token", async () => {
    const fetchMock = mockFetchOnce(200, {
      type: "SUCCESS",
      message: "ok",
      body: null,
      timestamp: "t",
    });
    const mutator = createNativeBootMutator({
      baseUrl: "http://api.test",
      getToken: () => "tok-123",
    });

    await mutator("/pets");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/pets");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer tok-123");
  });

  it("supports a custom raw token header", async () => {
    const fetchMock = mockFetchOnce(200, {
      type: "SUCCESS",
      message: "ok",
      body: null,
      timestamp: "t",
    });
    const mutator = createNativeBootMutator({
      baseUrl: "http://api.test",
      getToken: () => "identity-tok",
      tokenHeader: "X-Identity-Token",
      tokenScheme: null,
    });

    await mutator("/me");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get("X-Identity-Token")).toBe("identity-tok");
  });

  it("propagates the request locale as Accept-Language", async () => {
    setRequestLocale("ja");
    const fetchMock = mockFetchOnce(200, {
      type: "SUCCESS",
      message: "ok",
      body: null,
      timestamp: "t",
    });
    const mutator = createNativeBootMutator({ baseUrl: "http://api.test" });

    await mutator("/pets");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get("Accept-Language")).toBe("ja");
  });

  it("throws HttpError with the envelope message on failure", async () => {
    mockFetchOnce(409, {
      type: "CONFLICT",
      message: "Already checked in",
      body: null,
      timestamp: "t",
      errorCode: "VISIT_ALREADY_CHECKED_IN",
    });
    const mutator = createNativeBootMutator({ baseUrl: "http://api.test" });

    await expect(mutator("/check-in")).rejects.toMatchObject({
      status: 409,
      message: "Already checked in",
    });
    await expect(mutator("/check-in")).rejects.toBeInstanceOf(HttpError);
  });

  it("notifies onUnauthorized for 401 responses", async () => {
    mockFetchOnce(401, { type: "UNAUTHORIZED", message: "Invalid token", body: null, timestamp: "t" });
    const onUnauthorized = vi.fn();
    const mutator = createNativeBootMutator({
      baseUrl: "http://api.test",
      onUnauthorized,
    });

    await expect(mutator("/me")).rejects.toBeInstanceOf(HttpError);
    expect(onUnauthorized).toHaveBeenCalledWith({ status: 401, url: "/me" });
  });
});
