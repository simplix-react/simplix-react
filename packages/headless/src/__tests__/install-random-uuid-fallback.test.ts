import { afterEach, describe, expect, it, vi } from "vitest";

import { installRandomUUIDFallback, randomUUIDFrom } from "../crypto/install-random-uuid-fallback";

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("randomUUIDFrom", () => {
  it("writes the version and the variant over whatever the bytes were", () => {
    expect(randomUUIDFrom((bytes) => bytes.fill(0xff))).toBe("ffffffff-ffff-4fff-bfff-ffffffffffff");
    expect(randomUUIDFrom((bytes) => bytes.fill(0x00))).toBe("00000000-0000-4000-8000-000000000000");
  });

  it("spends every random byte, so two draws differ", () => {
    let n = 0;
    const counting = (bytes: Uint8Array) => bytes.map(() => n++);
    expect(randomUUIDFrom(counting)).toBe("00010203-0405-4607-8809-0a0b0c0d0e0f");
  });
});

describe("installRandomUUIDFallback", () => {
  it("fills a crypto that has getRandomValues but no randomUUID", () => {
    const fake = { getRandomValues: (bytes: Uint8Array) => bytes.fill(7) } as unknown as Crypto;
    vi.stubGlobal("crypto", fake);
    expect(installRandomUUIDFallback()).toBe(true);
    const id = (fake as Crypto).randomUUID();
    expect(id).toMatch(V4);
    expect(id).toBe("07070707-0707-4707-8707-070707070707");
  });

  it("leaves a real randomUUID alone", () => {
    const real = vi.fn(() => "11111111-1111-4111-8111-111111111111");
    const fake = { getRandomValues: (bytes: Uint8Array) => bytes, randomUUID: real } as unknown as Crypto;
    vi.stubGlobal("crypto", fake);
    expect(installRandomUUIDFallback()).toBe(false);
    expect(fake.randomUUID).toBe(real);
  });

  it("installs nothing where there is no crypto", () => {
    vi.stubGlobal("crypto", undefined);
    expect(installRandomUUIDFallback()).toBe(false);
  });
});
