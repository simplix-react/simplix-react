import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { Plugin } from "vite";

const WORKER_PATH = "/mockServiceWorker.js";

function getMswWorkerScript(): string {
  const require = createRequire(import.meta.url);
  const workerPath = require.resolve("msw/mockServiceWorker.js");
  return readFileSync(workerPath, "utf-8");
}

/**
 * Vite plugin that serves the MSW `mockServiceWorker.js` automatically.
 *
 * Eliminates the need to keep `mockServiceWorker.js` in the app's `public/` directory.
 *
 * - **Dev**: serves it via middleware at `/mockServiceWorker.js`
 * - **Build**: emits it as a static asset in the output directory
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { mswPlugin } from "@simplix-react/mock/vite";
 *
 * export default defineConfig({
 *   plugins: [mswPlugin()],
 * });
 * ```
 */
export function mswPlugin(): Plugin {
  let workerScript: string;

  return {
    name: "simplix-react:msw-worker",
    apply: (_config, env) => {
      // Only apply in dev or when building for non-production
      // In production builds, MSW is typically disabled, but we still
      // emit the file so the service worker can be unregistered cleanly
      return env.mode !== "production" || env.command === "serve";
    },

    configureServer(server) {
      workerScript ??= getMswWorkerScript();

      server.middlewares.use((req, res, next) => {
        if (req.url === WORKER_PATH) {
          res.setHeader("Content-Type", "application/javascript");
          res.end(workerScript);
          return;
        }
        next();
      });
    },

    generateBundle() {
      workerScript ??= getMswWorkerScript();

      this.emitFile({
        type: "asset",
        fileName: "mockServiceWorker.js",
        source: workerScript,
      });
    },
  };
}
