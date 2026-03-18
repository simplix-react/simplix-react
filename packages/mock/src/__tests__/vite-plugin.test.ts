import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";

// Mock node:fs to avoid reading actual msw worker file
vi.mock("node:fs", () => ({
  readFileSync: vi.fn().mockReturnValue("// mock service worker script content"),
}));

// Mock node:module to provide a fake require.resolve
vi.mock("node:module", () => ({
  createRequire: vi.fn().mockReturnValue({
    resolve: vi.fn().mockReturnValue("/fake/path/mockServiceWorker.js"),
  }),
}));

const { mswPlugin } = await import("../vite-plugin.js");

describe("mswPlugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a plugin object with correct name", () => {
    const plugin = mswPlugin();
    expect(plugin.name).toBe("simplix-react:msw-worker");
  });

  describe("apply", () => {
    it("returns true in development mode (serve command)", () => {
      const plugin = mswPlugin();
      const result = plugin.apply({}, { mode: "development", command: "serve" });
      expect(result).toBe(true);
    });

    it("returns true when mode is not production", () => {
      const plugin = mswPlugin();
      const result = plugin.apply({}, { mode: "development", command: "build" });
      expect(result).toBe(true);
    });

    it("returns true in production with serve command", () => {
      const plugin = mswPlugin();
      const result = plugin.apply({}, { mode: "production", command: "serve" });
      expect(result).toBe(true);
    });

    it("returns false in production build mode", () => {
      const plugin = mswPlugin();
      const result = plugin.apply({}, { mode: "production", command: "build" });
      expect(result).toBe(false);
    });
  });

  describe("configureServer", () => {
    it("adds middleware that serves mockServiceWorker.js", () => {
      const plugin = mswPlugin();

      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
      };
      const mockNext = vi.fn();
      const middlewares: Array<(req: unknown, res: unknown, next: unknown) => void> = [];

      const mockServer = {
        middlewares: {
          use: vi.fn((fn: (req: unknown, res: unknown, next: unknown) => void) => {
            middlewares.push(fn);
          }),
        },
      };

      plugin.configureServer(mockServer);
      expect(mockServer.middlewares.use).toHaveBeenCalledTimes(1);

      // Invoke the middleware with a matching URL
      const handler = middlewares[0];
      handler({ url: "/mockServiceWorker.js" }, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Type", "application/javascript");
      expect(mockRes.end).toHaveBeenCalledWith("// mock service worker script content");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("calls next() for non-matching URLs", () => {
      const plugin = mswPlugin();

      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
      };
      const mockNext = vi.fn();
      const middlewares: Array<(req: unknown, res: unknown, next: unknown) => void> = [];

      const mockServer = {
        middlewares: {
          use: vi.fn((fn: (req: unknown, res: unknown, next: unknown) => void) => {
            middlewares.push(fn);
          }),
        },
      };

      plugin.configureServer(mockServer);

      const handler = middlewares[0];
      handler({ url: "/other-path" }, mockRes, mockNext);

      expect(mockRes.setHeader).not.toHaveBeenCalled();
      expect(mockRes.end).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("generateBundle", () => {
    it("emits mockServiceWorker.js as an asset", () => {
      const plugin = mswPlugin();

      const mockEmitFile = vi.fn();
      const context = { emitFile: mockEmitFile };

      // Call generateBundle with the plugin context bound
      plugin.generateBundle.call(context);

      expect(mockEmitFile).toHaveBeenCalledWith({
        type: "asset",
        fileName: "mockServiceWorker.js",
        source: "// mock service worker script content",
      });
    });
  });

  describe("worker script caching", () => {
    it("lazy-loads and caches the worker script across multiple requests", () => {
      const mockedReadFileSync = vi.mocked(readFileSync);
      mockedReadFileSync.mockReturnValue("// cached script");

      const plugin = mswPlugin();

      const middlewares: Array<(req: unknown, res: unknown, next: unknown) => void> = [];
      const mockServer = {
        middlewares: {
          use: vi.fn((fn: (req: unknown, res: unknown, next: unknown) => void) => {
            middlewares.push(fn);
          }),
        },
      };

      plugin.configureServer(mockServer);

      const mockRes1 = { setHeader: vi.fn(), end: vi.fn() };
      const mockRes2 = { setHeader: vi.fn(), end: vi.fn() };
      const handler = middlewares[0];

      // Call twice — both should use the same cached script
      handler({ url: "/mockServiceWorker.js" }, mockRes1, vi.fn());
      handler({ url: "/mockServiceWorker.js" }, mockRes2, vi.fn());

      expect(mockRes1.end).toHaveBeenCalledWith("// cached script");
      expect(mockRes2.end).toHaveBeenCalledWith("// cached script");
    });
  });
});
