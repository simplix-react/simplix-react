import { describe, expect, it } from "vitest";

import { accessConfigTs } from "../templates/project/access-files.js";
import { appIndexTsx, appPackageJson, mainTsx, polyfillsTs } from "../templates/project/app-files.js";
import { authConfigTs } from "../templates/project/auth-files.js";
import { renderTemplate } from "../utils/template.js";

const versions = {
  fw: { ui: "^0.8.0", meta: "^0.9.0", bootAccess: "^0.9.1" },
  fwExact: {},
  deps: {},
};

const app = (flags: { enableAuth?: boolean; enableI18n?: boolean; enableAccess?: boolean }) => ({
  ...versions,
  projectName: "demo",
  scope: "@test",
  appPkgName: "@test/demo-demo",
  enableAuth: false,
  enableI18n: false,
  enableAccess: false,
  ...flags,
});

describe("app-index-tsx", () => {
  const rendered = renderTemplate(appIndexTsx, app({}));

  it("gives the router the framework's flat search and the app's base path", () => {
    expect(rendered).toContain('import { createTanstackRouterAdapter, flatSearch, RouterContext } from "@simplix-react/ui";');
    expect(rendered).toMatch(/createRouter\(\{\s*routeTree,[\s\S]*basepath: import\.meta\.env\.BASE_URL,[\s\S]*\.\.\.flatSearch,\s*\}\)/);
  });

  it("provides the router adapter above the router", () => {
    expect(rendered).toContain("const routerAdapter = createTanstackRouterAdapter(router);");
    expect(rendered).toMatch(/<RouterContext\.Provider value=\{routerAdapter\}>\s*<RouterProvider router=\{router\} \/>\s*<\/RouterContext\.Provider>/);
  });
});

describe("main-tsx", () => {
  it("restores the session before the first render and clears a stale mock worker with the session's prefix", () => {
    const rendered = renderTemplate(mainTsx, app({ enableAuth: true, enableI18n: true }));
    expect(rendered).toMatch(/^import "\.\/polyfills";/);
    expect(rendered).toContain('import { auth, AUTH_STORE_PREFIX } from "./app/auth";');
    expect(rendered).toContain("return { reloading: await stopMocking({ storePrefix: AUTH_STORE_PREFIX }) };");
    expect(rendered).toContain("Promise.all([enableMocking(), auth.rehydrate(), i18nReady]).then(([mocking]) => {");
    expect(rendered).toMatch(/if \(mocking\.reloading\) return;\s*const rootElement/);
  });

  it("without auth or i18n waits only for the mock decision and names no session", () => {
    const rendered = renderTemplate(mainTsx, app({}));
    expect(rendered).toContain("Promise.all([enableMocking()]).then(([mocking]) => {");
    expect(rendered).toContain("return { reloading: await stopMocking() };");
    expect(rendered).not.toContain("auth");
  });

  it("mocks only when the flag asks and never in a production build", () => {
    const rendered = renderTemplate(mainTsx, app({}));
    expect(rendered).toContain('if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_MOCK !== "true") {');
  });
});

describe("auth config", () => {
  it("exports the store prefix the boot hands to stopMocking", () => {
    const rendered = renderTemplate(authConfigTs, app({ enableAuth: true }));
    expect(rendered).toContain('export const AUTH_STORE_PREFIX = "demo:";');
    expect(rendered).toContain("const store = localStorageStore(AUTH_STORE_PREFIX);");
  });
});

describe("polyfills-ts", () => {
  it("installs both secure-context fills from the framework", () => {
    expect(polyfillsTs).toContain('import { installClipboardFallback, installRandomUUIDFallback } from "@simplix-react/ui";');
    expect(polyfillsTs).toMatch(/^installClipboardFallback\(\);$/m);
    expect(polyfillsTs).toMatch(/^installRandomUUIDFallback\(\);$/m);
  });
});

describe("access config", () => {
  it("reads the signed-in user's grants through the self access policy and the auth fetch", () => {
    const rendered = renderTemplate(accessConfigTs, app({ enableAuth: true, enableAccess: true }));
    expect(rendered).toContain('import { createSelfAccessPolicy } from "@simplix-react-ext/simplix-boot-access";');
    expect(rendered).toMatch(/createSelfAccessPolicy\(\{\s*endpoint: "\/api\/v1\/user\/me\/permissions",\s*fetchFn: auth\.fetchFn,\s*\}\)/);
    expect(rendered).not.toContain("createApiAdapter");
  });

  it("without auth keeps the plain policy, which has no session to read", () => {
    const rendered = renderTemplate(accessConfigTs, app({ enableAccess: true }));
    expect(rendered).toContain("createAccessPolicy");
    expect(rendered).not.toContain("createSelfAccessPolicy");
  });

  it("the app depends on the boot access extension exactly when the template imports it", () => {
    const withSelf = JSON.parse(renderTemplate(appPackageJson, app({ enableAuth: true, enableAccess: true })));
    expect(withSelf.dependencies["@simplix-react-ext/simplix-boot-access"]).toBe("^0.9.1");
    const without = JSON.parse(renderTemplate(appPackageJson, app({ enableAccess: true })));
    expect(without.dependencies["@simplix-react-ext/simplix-boot-access"]).toBeUndefined();
  });
});
