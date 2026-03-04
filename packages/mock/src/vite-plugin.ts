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
 * @remarks
 * ## Why `any` return type instead of `Plugin`?
 *
 * When this package is consumed via pnpm `link:` dependencies across separate
 * workspaces (e.g. simplix-react ↔ consumer app), each workspace resolves its
 * own `vite` instance from a different pnpm virtual store path — even when
 * both are the same version. TypeScript treats these as distinct nominal types,
 * causing TS2769 ("No overload matches this call") in the consumer's
 * `vite.config.ts`.
 *
 * Returning `any` instead of `Plugin` removes the vite type import from the
 * generated `.d.ts`, eliminating the cross-workspace type conflict entirely.
 *
 * - **External safety**: consumers only pass the result to vite's `plugins`
 *   array, so `any` is sufficient.
 * - **Internal safety**: the local `plugin` variable is typed as `Plugin`,
 *   preserving full type-checking within this file.
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mswPlugin(): any {
  let workerScript: string;

  const plugin: Plugin = {
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

  return plugin;
}
