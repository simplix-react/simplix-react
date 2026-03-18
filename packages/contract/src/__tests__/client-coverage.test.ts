import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { deriveClient } from "../derive/client.js";
import { ApiError } from "../helpers/fetch.js";

// ── Multipart and Blob operation tests ──
// These cover uncovered lines 284-299 (entity generic), 341-346 (top-level),
// and 362-412 (toFormData, multipartFetch, blobFetch) in client.ts.

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
});

// Save original fetch
const originalFetch = globalThis.fetch;

beforeEach(() => {
  // Reset fetch mock before each test
  vi.restoreAllMocks();
});

afterEach(() => {
  // Restore original fetch
  globalThis.fetch = originalFetch;
});

// ── Entity operations: contentType "multipart" ──

describe("deriveClient entity multipart operations", () => {
  it("sends multipart form data for entity operation with contentType=multipart", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { id: "1", url: "/files/1.png" } }),
      text: vi.fn(),
      blob: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            upload: {
              method: "POST" as const,
              path: "/tasks/:id/upload",
              input: z.object({ file: z.any() }),
              contentType: "multipart" as const,
            },
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({ id: "1" });
    const client = deriveClient(config, mockFetch);
    const taskClient = client.task as { upload: (...args: unknown[]) => Promise<unknown> };

    // When contentType is "multipart", it calls the real fetch, not fetchFn
    await taskClient.upload("task-1", { name: "test.png", description: "A file" });

    // multipartFetch uses globalThis.fetch directly
    expect(globalThis.fetch).toHaveBeenCalled();
    const [url, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/v1/tasks/task-1/upload");
    expect(opts.method).toBe("POST");
    expect(opts.body).toBeInstanceOf(FormData);
  });

  it("returns json.data when multipart response has data envelope", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { id: "1", url: "/files/1.png" } }),
      text: vi.fn(),
      blob: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            upload: {
              method: "POST" as const,
              path: "/tasks/upload",
              input: z.object({ file: z.any() }),
              contentType: "multipart" as const,
            },
          },
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const taskClient = client.task as { upload: (...args: unknown[]) => Promise<unknown> };

    const result = await taskClient.upload({ name: "test.png" });
    expect(result).toEqual({ id: "1", url: "/files/1.png" });
  });

  it("returns raw json when multipart response has no data envelope", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: "1", url: "/files/1.png" }),
      text: vi.fn(),
      blob: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            upload: {
              method: "POST" as const,
              path: "/tasks/upload",
              input: z.object({ file: z.any() }),
              contentType: "multipart" as const,
            },
          },
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const taskClient = client.task as { upload: (...args: unknown[]) => Promise<unknown> };

    const result = await taskClient.upload({ name: "test.png" });
    expect(result).toEqual({ id: "1", url: "/files/1.png" });
  });

  it("throws ApiError for failed multipart request", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: vi.fn(),
      text: vi.fn().mockResolvedValue("Internal Server Error"),
      blob: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            upload: {
              method: "POST" as const,
              path: "/tasks/upload",
              input: z.object({ file: z.any() }),
              contentType: "multipart" as const,
            },
          },
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const taskClient = client.task as { upload: (...args: unknown[]) => Promise<unknown> };

    await expect(taskClient.upload({ name: "test.png" })).rejects.toThrow(ApiError);
  });

  it("returns blob for multipart with responseType=blob", async () => {
    const mockBlob = new Blob(["hello"], { type: "application/octet-stream" });
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn(),
      text: vi.fn(),
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            upload: {
              method: "POST" as const,
              path: "/tasks/upload",
              input: z.object({ file: z.any() }),
              contentType: "multipart" as const,
              responseType: "blob" as const,
            },
          },
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const taskClient = client.task as { upload: (...args: unknown[]) => Promise<unknown> };

    const result = await taskClient.upload({ name: "test.png" });
    expect(result).toBe(mockBlob);
  });
});

// ── Entity operations: responseType "blob" ──

describe("deriveClient entity blob operations", () => {
  it("returns blob for entity operation with responseType=blob (GET)", async () => {
    const mockBlob = new Blob(["file-content"], { type: "application/pdf" });
    const mockResponse = {
      ok: true,
      status: 200,
      blob: vi.fn().mockResolvedValue(mockBlob),
      text: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            download: {
              method: "GET" as const,
              path: "/tasks/:id/download",
              responseType: "blob" as const,
            },
          },
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const taskClient = client.task as { download: (...args: unknown[]) => Promise<unknown> };

    const result = await taskClient.download("task-1");
    expect(result).toBe(mockBlob);

    const [url, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/v1/tasks/task-1/download");
    expect(opts.method).toBe("GET");
    // GET does not add body or content-type header
    expect(opts.body).toBeUndefined();
  });

  it("returns blob for entity operation with responseType=blob (POST with body)", async () => {
    const mockBlob = new Blob(["pdf-content"], { type: "application/pdf" });
    const mockResponse = {
      ok: true,
      status: 200,
      blob: vi.fn().mockResolvedValue(mockBlob),
      text: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            exportPdf: {
              method: "POST" as const,
              path: "/tasks/export",
              input: z.object({ ids: z.array(z.string()) }),
              responseType: "blob" as const,
            },
          },
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const taskClient = client.task as { exportPdf: (...args: unknown[]) => Promise<unknown> };

    const result = await taskClient.exportPdf({ ids: ["1", "2"] });
    expect(result).toBe(mockBlob);

    const [url, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/v1/tasks/export");
    expect(opts.method).toBe("POST");
    expect(opts.body).toBe(JSON.stringify({ ids: ["1", "2"] }));
    expect(opts.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("throws ApiError for failed blob request", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      blob: vi.fn(),
      text: vi.fn().mockResolvedValue("Not Found"),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "project",
      basePath: "/api/v1",
      entities: {
        task: {
          schema: taskSchema,
          operations: {
            download: {
              method: "GET" as const,
              path: "/tasks/:id/download",
              responseType: "blob" as const,
            },
          },
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const taskClient = client.task as { download: (...args: unknown[]) => Promise<unknown> };

    await expect(taskClient.download("task-1")).rejects.toThrow(ApiError);
  });
});

// ── Top-level operations: contentType "multipart" ──

describe("deriveClient top-level multipart operations", () => {
  it("sends multipart form data for top-level operation", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { url: "/uploads/img.png" } }),
      text: vi.fn(),
      blob: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "files",
      basePath: "/api/v1",
      entities: {},
      operations: {
        uploadFile: {
          method: "POST" as const,
          path: "/files/upload",
          input: z.object({ file: z.any(), description: z.string() }),
          output: z.object({ url: z.string() }),
          contentType: "multipart" as const,
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const uploadFile = client.uploadFile as (...args: unknown[]) => Promise<unknown>;

    const result = await uploadFile({ description: "Test file" });
    expect(result).toEqual({ url: "/uploads/img.png" });

    expect(globalThis.fetch).toHaveBeenCalled();
    const [url, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/v1/files/upload");
    expect(opts.method).toBe("POST");
    expect(opts.body).toBeInstanceOf(FormData);
  });
});

// ── Top-level operations: responseType "blob" ──

describe("deriveClient top-level blob operations", () => {
  it("returns blob for top-level operation with responseType=blob", async () => {
    const mockBlob = new Blob(["report"], { type: "application/pdf" });
    const mockResponse = {
      ok: true,
      status: 200,
      blob: vi.fn().mockResolvedValue(mockBlob),
      text: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "reports",
      basePath: "/api/v1",
      entities: {},
      operations: {
        downloadReport: {
          method: "GET" as const,
          path: "/reports/:reportId/download",
          input: z.object({}),
          output: z.any(),
          responseType: "blob" as const,
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const downloadReport = client.downloadReport as (...args: unknown[]) => Promise<unknown>;

    const result = await downloadReport("rpt-1");
    expect(result).toBe(mockBlob);

    const [url, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/v1/reports/rpt-1/download");
    expect(opts.method).toBe("GET");
  });

  it("returns blob for top-level POST blob operation with body", async () => {
    const mockBlob = new Blob(["csv-data"], { type: "text/csv" });
    const mockResponse = {
      ok: true,
      status: 200,
      blob: vi.fn().mockResolvedValue(mockBlob),
      text: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "reports",
      basePath: "/api/v1",
      entities: {},
      operations: {
        exportCsv: {
          method: "POST" as const,
          path: "/reports/export",
          input: z.object({ filters: z.any() }),
          output: z.any(),
          responseType: "blob" as const,
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const exportCsv = client.exportCsv as (...args: unknown[]) => Promise<unknown>;

    const result = await exportCsv({ filters: { status: "active" } });
    expect(result).toBe(mockBlob);

    const [url, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/v1/reports/export");
    expect(opts.method).toBe("POST");
    expect(opts.body).toBe(JSON.stringify({ filters: { status: "active" } }));
  });
});

// ── toFormData utility function coverage ──

describe("deriveClient toFormData edge cases", () => {
  it("handles File instance in multipart data", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { id: "1" } }),
      text: vi.fn(),
      blob: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "files",
      basePath: "/api",
      entities: {},
      operations: {
        upload: {
          method: "POST" as const,
          path: "/upload",
          input: z.object({ file: z.any(), name: z.string() }),
          output: z.object({ id: z.string() }),
          contentType: "multipart" as const,
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const upload = client.upload as (...args: unknown[]) => Promise<unknown>;

    const file = new File(["content"], "test.txt", { type: "text/plain" });
    await upload({ file, name: "test" });

    const [, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const formData = opts.body as FormData;
    expect(formData.get("file")).toBeInstanceOf(File);
    expect(formData.get("name")).toBe("test");
  });

  it("handles Blob instance in multipart data", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { id: "2" } }),
      text: vi.fn(),
      blob: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "files",
      basePath: "/api",
      entities: {},
      operations: {
        upload: {
          method: "POST" as const,
          path: "/upload",
          input: z.object({ blob: z.any() }),
          output: z.object({ id: z.string() }),
          contentType: "multipart" as const,
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const upload = client.upload as (...args: unknown[]) => Promise<unknown>;

    const blob = new Blob(["data"], { type: "application/octet-stream" });
    await upload({ blob });

    const [, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const formData = opts.body as FormData;
    expect(formData.get("blob")).toBeInstanceOf(Blob);
  });

  it("skips null and undefined values in multipart data", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { id: "3" } }),
      text: vi.fn(),
      blob: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "files",
      basePath: "/api",
      entities: {},
      operations: {
        upload: {
          method: "POST" as const,
          path: "/upload",
          input: z.object({ name: z.string(), optional: z.any() }),
          output: z.object({ id: z.string() }),
          contentType: "multipart" as const,
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const upload = client.upload as (...args: unknown[]) => Promise<unknown>;

    await upload({ name: "test", optional: null, extra: undefined });

    const [, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const formData = opts.body as FormData;
    expect(formData.get("name")).toBe("test");
    expect(formData.get("optional")).toBeNull();
    expect(formData.get("extra")).toBeNull();
  });

  it("converts non-string primitive values to strings in multipart data", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { id: "4" } }),
      text: vi.fn(),
      blob: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "files",
      basePath: "/api",
      entities: {},
      operations: {
        upload: {
          method: "POST" as const,
          path: "/upload",
          input: z.object({ count: z.number(), active: z.boolean() }),
          output: z.object({ id: z.string() }),
          contentType: "multipart" as const,
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const upload = client.upload as (...args: unknown[]) => Promise<unknown>;

    await upload({ count: 42, active: true });

    const [, opts] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const formData = opts.body as FormData;
    expect(formData.get("count")).toBe("42");
    expect(formData.get("active")).toBe("true");
  });
});

// ── blobFetch error handling ──

describe("deriveClient blobFetch error handling", () => {
  it("throws ApiError with status and body on blob fetch failure", async () => {
    const mockResponse = {
      ok: false,
      status: 403,
      blob: vi.fn(),
      text: vi.fn().mockResolvedValue("Forbidden"),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "reports",
      basePath: "/api",
      entities: {},
      operations: {
        download: {
          method: "GET" as const,
          path: "/download",
          input: z.object({}),
          output: z.any(),
          responseType: "blob" as const,
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const download = client.download as (...args: unknown[]) => Promise<unknown>;

    try {
      await download();
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(403);
    }
  });
});

// ── multipartFetch error handling ──

describe("deriveClient multipartFetch error handling", () => {
  it("throws ApiError with status and body on multipart fetch failure", async () => {
    const mockResponse = {
      ok: false,
      status: 413,
      json: vi.fn(),
      text: vi.fn().mockResolvedValue("Payload Too Large"),
      blob: vi.fn(),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const config = {
      domain: "files",
      basePath: "/api",
      entities: {},
      operations: {
        upload: {
          method: "POST" as const,
          path: "/upload",
          input: z.object({ file: z.any() }),
          output: z.any(),
          contentType: "multipart" as const,
        },
      },
    };

    const client = deriveClient(config, vi.fn());
    const upload = client.upload as (...args: unknown[]) => Promise<unknown>;

    try {
      await upload({ file: "big-data" });
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(413);
    }
  });
});
