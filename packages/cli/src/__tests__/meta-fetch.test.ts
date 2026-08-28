import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { fetchMeta, SUPPORTED_IR_VERSION } from "../meta/fetch.js";
import type { DtoMeta } from "../meta/ir-types.js";

const fixturePath = fileURLToPath(
  new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url),
);

/** A minimal but structurally valid IR, so a test never depends on the 2.7 MB fixture. */
const tinyIr: DtoMeta = {
  version: 1,
  enums: {},
  types: {
    ItemDTO: { javaClass: "com.example.ItemDTO", typeParams: [], fields: [] },
  },
  operations: [],
};

/** The SimpliX envelope the endpoint returns, wrapping the IR in `body`. */
function envelope(body: unknown): Record<string, unknown> {
  return {
    type: "SUCCESS",
    message: "OK",
    body,
    timestamp: "2026-08-29T00:00:00Z",
  };
}

function stubFetch(response: Partial<Response> & { text?: () => Promise<string> }): void {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

function okResponse(payload: unknown): Partial<Response> & { text: () => Promise<string> } {
  return { ok: true, status: 200, statusText: "OK", text: () => Promise.resolve(JSON.stringify(payload)) };
}

let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "simplix-meta-fetch-"));
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchMeta", () => {
  it("supports IR version 1", () => {
    expect(SUPPORTED_IR_VERSION).toBe(1);
  });

  it("reads the committed fixture from disk", async () => {
    const meta = await fetchMeta({ source: fixturePath });

    expect(meta.version).toBe(1);
    expect(Object.keys(meta.types)).toHaveLength(646);
    expect(Object.keys(meta.enums)).toHaveLength(133);
    expect(meta.operations).toHaveLength(694);
  });

  it("unwraps an HTTP response to its envelope body", async () => {
    stubFetch(okResponse(envelope(tinyIr)));

    const meta = await fetchMeta({ source: "https://api.example.com/dev/meta/dto" });

    expect(meta).toEqual(tinyIr);
    expect(fetch).toHaveBeenCalledWith("https://api.example.com/dev/meta/dto");
  });

  it("names the envelope's type and message when an HTTP response carries no body", async () => {
    stubFetch(
      okResponse({
        type: "ERROR",
        message: "Duplicate DTO simple name",
        errorCode: "META_DUPLICATE_TYPE",
        timestamp: "2026-08-29T00:00:00Z",
      }),
    );

    await expect(
      fetchMeta({ source: "https://api.example.com/dev/meta/dto" }),
    ).rejects.toThrow(/type="ERROR".*message="Duplicate DTO simple name"/s);
  });

  it("surfaces the response body of a non-2xx status", async () => {
    stubFetch({
      ok: false,
      status: 409,
      statusText: "Conflict",
      text: () =>
        Promise.resolve("Duplicate DTO simple name ItemDTO: com.a.ItemDTO and com.b.ItemDTO"),
    });

    await expect(
      fetchMeta({ source: "https://api.example.com/dev/meta/dto" }),
    ).rejects.toThrow(/409 Conflict.*com\.a\.ItemDTO and com\.b\.ItemDTO/s);
  });

  it("reads a snapshot saved whole and one saved bare as the same document", async () => {
    const enveloped = join(tempDir, "enveloped.json");
    const bare = join(tempDir, "bare.json");
    await writeFile(enveloped, JSON.stringify(envelope(tinyIr)), "utf-8");
    await writeFile(bare, JSON.stringify(tinyIr), "utf-8");

    const fromEnveloped = await fetchMeta({ source: "unused", offline: true, snapshot: enveloped });
    const fromBare = await fetchMeta({ source: "unused", offline: true, snapshot: bare });

    expect(fromEnveloped).toEqual(tinyIr);
    expect(fromBare).toEqual(fromEnveloped);
  });

  it("writes the bare IR to the snapshot path after a fetch", async () => {
    const snapshot = join(tempDir, "written.json");
    stubFetch(okResponse(envelope(tinyIr)));

    await fetchMeta({ source: "https://api.example.com/dev/meta/dto", snapshot });

    expect(JSON.parse(await readFile(snapshot, "utf-8"))).toEqual(tinyIr);
  });

  it("refuses an IR newer than this CLI, telling the operator to upgrade", async () => {
    const future = join(tempDir, "future.json");
    await writeFile(future, JSON.stringify({ ...tinyIr, version: 2 }), "utf-8");

    await expect(fetchMeta({ source: future })).rejects.toThrow(
      /version 2 is newer.*Upgrade @simplix-react\/cli/s,
    );
  });

  it("names the path when the snapshot file is missing", async () => {
    const missing = join(tempDir, "not-there.json");

    await expect(
      fetchMeta({ source: "https://api.example.com/dev/meta/dto", offline: true, snapshot: missing }),
    ).rejects.toThrow(missing);
  });

  it("asks for a snapshot path when offline mode has none", async () => {
    await expect(
      fetchMeta({ source: "https://api.example.com/dev/meta/dto", offline: true }),
    ).rejects.toThrow(/snapshot/i);
  });

  it("rejects a snapshot that is neither an IR nor an envelope", async () => {
    const junk = join(tempDir, "junk.json");
    await writeFile(junk, JSON.stringify({ types: {}, operations: [] }), "utf-8");

    await expect(fetchMeta({ source: junk })).rejects.toThrow(/no `version`.*no `body`/s);
  });

  it("names the file when its content is not valid JSON", async () => {
    const broken = join(tempDir, "broken.json");
    await writeFile(broken, "{ not json", "utf-8");

    await expect(fetchMeta({ source: broken })).rejects.toThrow(
      new RegExp(`${broken.replaceAll(".", "\\.")} is not valid JSON`),
    );
  });
});
