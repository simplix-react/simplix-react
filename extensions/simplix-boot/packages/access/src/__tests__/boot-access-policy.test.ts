import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/access", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@simplix-react/access")>();
  return {
    ...actual,
    createAccessPolicy: vi.fn((config) => ({
      _config: config,
      can: vi.fn(),
      update: vi.fn(),
    })),
  };
});

import { createBootAccessPolicy } from "../boot-access-policy.js";
import { createAccessPolicy } from "@simplix-react/access";

describe("createBootAccessPolicy", () => {
  beforeEach(() => {
    vi.mocked(createAccessPolicy).mockClear();
  });

  it("creates an access policy with the provided fetchFn", () => {
    const mockFetch = vi.fn().mockResolvedValue({
      permissions: {},
      roles: [],
      isSuperAdmin: false,
    });

    createBootAccessPolicy({ fetchFn: mockFetch });

    expect(createAccessPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        adapter: expect.any(Object),
        publicAccess: expect.any(Object),
      }),
    );
  });

  it("enables public access by default", () => {
    const mockFetch = vi.fn().mockResolvedValue({
      permissions: {},
      roles: [],
      isSuperAdmin: false,
    });

    createBootAccessPolicy({ fetchFn: mockFetch });

    expect(createAccessPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        publicAccess: expect.any(Object),
      }),
    );
  });

  it("disables public access when enablePublicAccess is false", () => {
    const mockFetch = vi.fn().mockResolvedValue({
      permissions: {},
      roles: [],
      isSuperAdmin: false,
    });

    createBootAccessPolicy({ fetchFn: mockFetch, enablePublicAccess: false });

    const calledWith = vi.mocked(createAccessPolicy).mock.calls[0][0];
    expect(calledWith.publicAccess).toBeUndefined();
  });

  it("passes isSuperAdmin function", () => {
    const mockFetch = vi.fn();
    const customSuperAdmin = vi.fn(() => true);

    createBootAccessPolicy({
      fetchFn: mockFetch,
      isSuperAdmin: customSuperAdmin,
    });

    const calledWith = vi.mocked(createAccessPolicy).mock.calls[0][0];
    expect(calledWith.isSuperAdmin).toBe(customSuperAdmin);
  });

  it("uses default isSuperAdmin when not provided", () => {
    const mockFetch = vi.fn();

    createBootAccessPolicy({ fetchFn: mockFetch });

    const calledWith = vi.mocked(createAccessPolicy).mock.calls[0][0];
    expect(calledWith.isSuperAdmin).toBeDefined();
    expect(typeof calledWith.isSuperAdmin).toBe("function");
  });

  it("default isSuperAdmin returns true when user.isSuperAdmin is true", () => {
    const mockFetch = vi.fn();

    createBootAccessPolicy({ fetchFn: mockFetch });

    const calledWith = vi.mocked(createAccessPolicy).mock.calls[0][0];
    const isSuperAdmin = calledWith.isSuperAdmin!;

    expect(isSuperAdmin({ userId: "1", username: "admin", roles: [], isSuperAdmin: true })).toBe(true);
    expect(isSuperAdmin({ userId: "2", username: "user", roles: [], isSuperAdmin: false })).toBe(false);
    expect(isSuperAdmin({ userId: "3", username: "user", roles: [] } as never)).toBe(false);
  });

  it("passes persist config", () => {
    const mockFetch = vi.fn();
    const persist = { storage: {} as Storage };

    createBootAccessPolicy({
      fetchFn: mockFetch,
      persist,
    });

    const calledWith = vi.mocked(createAccessPolicy).mock.calls[0][0];
    expect(calledWith.persist).toBe(persist);
  });

  it("unwraps Boot envelope when fetchFn returns envelope format", async () => {
    const innerData = {
      permissions: { Pet: ["list"] },
      roles: ["ROLE_USER"],
      isSuperAdmin: false,
    };
    const mockFetch = vi.fn().mockResolvedValue({
      type: "SUCCESS",
      body: innerData,
    });

    createBootAccessPolicy({ fetchFn: mockFetch });

    const calledWith = vi.mocked(createAccessPolicy).mock.calls[0][0];
    const adapter = calledWith.adapter;

    const result = await adapter.extract("some-token");

    expect(mockFetch).toHaveBeenCalled();
    expect(result.rules).toBeDefined();
    expect(result.rules).toEqual(
      expect.arrayContaining([{ action: "list", subject: "Pet" }]),
    );
  });

  it("passes through non-envelope response", async () => {
    const directData = {
      permissions: { Pet: ["list", "view"] },
      roles: ["ROLE_USER"],
      isSuperAdmin: false,
    };
    const mockFetch = vi.fn().mockResolvedValue(directData);

    createBootAccessPolicy({ fetchFn: mockFetch });

    const calledWith = vi.mocked(createAccessPolicy).mock.calls[0][0];
    const adapter = calledWith.adapter;

    const result = await adapter.extract("token");
    expect(result.rules).toEqual(
      expect.arrayContaining([
        { action: "list", subject: "Pet" },
        { action: "view", subject: "Pet" },
      ]),
    );
  });

  it("forwards adapterOptions to adapter", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      permissions: {},
      roles: [],
      isSuperAdmin: false,
    });

    createBootAccessPolicy({
      fetchFn: mockFetch,
      adapterOptions: {
        permissionsEndpoint: "/custom/perms",
        publicPermissionsEndpoint: "/custom/public/perms",
      },
    });

    const calledWith = vi.mocked(createAccessPolicy).mock.calls[0][0];
    const adapter = calledWith.adapter;

    // Call with auth data - should use custom endpoint
    await adapter.extract("token");
    expect(mockFetch).toHaveBeenCalledWith("/custom/perms", undefined);

    // Call with null - should use custom public endpoint
    await adapter.extract(null);
    expect(mockFetch).toHaveBeenCalledWith("/custom/public/perms", undefined);
  });
});
