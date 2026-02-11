// Demo app template files

export const appPackageJson = `{
  "name": "{{appPkgName}}",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:app": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "test": "vitest run --passWithNoTests",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "simplix-react": "{{fw.meta}}",
    "@tanstack/react-query": "{{deps.tanstackReactQuery}}",
    "@tanstack/react-router": "{{deps.tanstackReactRouter}}",
    "lucide-react": "{{deps.lucideReact}}",
    "react": "{{deps.react}}",
    "react-dom": "{{deps.reactDom}}"
  },
  "devDependencies": {
    "@tanstack/router-plugin": "{{deps.tanstackRouterPlugin}}",
    "@types/react": "{{deps.typesReact}}",
    "@types/react-dom": "{{deps.typesReactDom}}",
    "@vitejs/plugin-react": "{{deps.vitejsPluginReact}}",
    "autoprefixer": "{{deps.autoprefixer}}",
    "postcss": "{{deps.postcss}}",
    "tailwindcss": "{{deps.tailwindcss}}",
    "typescript": "{{deps.typescript}}",
    "vite": "{{deps.vite}}",
    "vitest": "{{deps.vitest}}"
  }
}
`;

export const appTsconfigJson = `{
  "extends": "../../config/typescript/react.json",
  "compilerOptions": {
    "outDir": "dist",
    "baseUrl": ".",
    "types": ["vite/client"]
  },
  "include": ["src"]
}
`;

export const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  server: {
    port: 3000,
    open: true,
  },
});
`;

export const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

export const indexCss = `@import "tailwindcss";

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
`;

export const mainTsx = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app";

async function enableMocking() {
  if (import.meta.env.PROD) return;
  const { setupMockWorker } = await import("@simplix-react/mock");
  await setupMockWorker({
    handlers: [],
    migrations: [],
  });
}

enableMocking().then(() => {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
`;

export const appIndexTsx = `import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { AppProviders } from "./providers/app-providers";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
`;

export const appProvidersTsx = `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
`;

export const errorFallbacksTsx = `export function RouteErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: "2rem", color: "#EF4444" }}>
      <h2>Something went wrong</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{error.message}</pre>
    </div>
  );
}
`;

export const pageLoadingFallbackTsx = `export function PageLoadingFallback() {
  return (
    <div style={{ padding: "2rem", color: "#94A3B8" }}>
      Loading...
    </div>
  );
}
`;
