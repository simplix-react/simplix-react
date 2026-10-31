import { describe, expect, it } from "vitest";

import { PAGE_KINDS, pageStoryFile, parsePageKind, renderPageKind, renderPageKindStory } from "../commands/add-page.js";
import { isUntouchedRender } from "../utils/project-templates.js";

describe("add-page", () => {
  it("accepts a kind with or without its suffix and refuses an unknown one", () => {
    expect(parsePageKind("record")).toBe("record-page");
    expect(parsePageKind("error-page")).toBe("error-page");
    expect(parsePageKind("app-shell")).toBe("app-shell");
    expect(() => parsePageKind("wizard")).toThrow(/Unknown page kind/);
  });

  it.each(PAGE_KINDS.filter((kind) => kind !== "app-shell" && kind !== "auth-page"))("renders %s from the bundled template, stamped and with its blocks", (kind) => {
    const files = renderPageKind(kind, "my-profile", "user-self/pages", new Map());
    expect(files["page.tsx"]).toContain("export function MyProfilePage()");
    expect(files["page.tsx"]).toContain('useTranslation("user-self/pages")');
    expect(isUntouchedRender(files["page.tsx"]!)).toBe(true);
    expect(files["page.blocks.tsx"]).toContain("export function usePageBlocks()");
  });

  it("draws a kind from the templates in force over the bundled one", () => {
    const files = renderPageKind("dashboard-page", "home", "common", new Map([["dashboard-page", "/** @simplix-generated x */\nkit {{NamePascal}}"], ["dashboard-page.blocks", "kit blocks"]]));
    expect(files["page.tsx"]).toContain("kit Home");
    expect(files["page.blocks.tsx"]).toBe("kit blocks");
  });

  it("refuses the app shell when no kit or project template draws one", () => {
    expect(() => renderPageKind("app-shell", "admin", "common", new Map())).toThrow(/must supply app-shell.hbs/);
    expect(renderPageKind("app-shell", "admin", "common", new Map([["app-shell", "shell {{NamePascal}}"]]))["page.tsx"]).toContain("shell Admin");
  });

  it("draws a variant of a kind from its own templates, and never from the plain kind's", () => {
    const templates = new Map([
      ["app-shell", "console {{NamePascal}}"],
      ["app-shell.top-bar", "bar {{NamePascal}}"],
      ["app-shell.top-bar.blocks", "bar blocks"],
      ["app-shell.top-bar.stories", "bar frame {{storyTitle}}"],
    ]);
    const files = renderPageKind("app-shell", "portal", "common", templates, undefined, "top-bar");
    expect(files["page.tsx"]).toContain("bar Portal");
    expect(files["page.blocks.tsx"]).toBe("bar blocks");
    expect(renderPageKindStory("app-shell", "portal", "common", templates, "portal", "top-bar")).toBe("bar frame Portal/Portal");
    expect(renderPageKindStory("app-shell", "portal", "common", templates, "portal")).toBeUndefined();
    expect(() => renderPageKind("app-shell", "portal", "common", new Map([["app-shell", "console"]]), undefined, "top-bar")).toThrow(/must supply app-shell.top-bar.hbs/);
  });

  it("refuses the sign-in page when no kit or project template draws one", () => {
    expect(parsePageKind("auth")).toBe("auth-page");
    expect(() => renderPageKind("auth-page", "sign-in", "common", new Map())).toThrow(/must supply auth-page.hbs/);
  });

  it("renders a page's board frame from the kind's story template, and none without one", () => {
    expect(renderPageKindStory("static-page", "my-profile", "user-self/pages", new Map())).toBeUndefined();
    const story = renderPageKindStory("static-page", "my-profile", "user-self/pages", new Map([["static-page.stories", "frame {{NamePascal}} {{namespace}}"]]));
    expect(story).toBe("frame MyProfile user-self/pages");
    const titled = new Map([["auth-page.stories", "title {{storyTitle}}"]]);
    expect(renderPageKindStory("auth-page", "sign-in", "common", titled, "stagevoice-admin")).toBe("title StagevoiceAdmin/SignIn");
    expect(renderPageKindStory("auth-page", "sign-in", "common", titled)).toBe("title SignIn");
  });

  it("names an app's frame after the app, so two apps' pages of one name do not collide", () => {
    expect(pageStoryFile("sign-in", { app: "stagevoice-admin" })).toBe("stagevoice-admin-sign-in.stories.tsx");
    expect(pageStoryFile("myProfile", { module: "user-self" })).toBe("my-profile.stories.tsx");
  });
});
