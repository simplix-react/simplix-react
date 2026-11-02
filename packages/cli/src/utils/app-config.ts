import type { SimplixConfig, SimplixTemplatesConfig } from "../config/types.js";

/** Who owns a generated page: an app named outright, or the group of the module the page is written into. */
export interface PageOwner {
  /** The app `--app` names. */
  readonly app?: string;
  /** The group of the module `--module <group>/<name>` names; undefined for an ungrouped module. */
  readonly moduleGroup?: string;
}

/**
 * The app whose settings a generated page reads.
 *
 * <p>`--app` names it outright. A module page belongs to the app whose `moduleGroups` holds the
 * module's group; a group no app names belongs to none, and the page reads the top-level settings.
 *
 * @throws Error when two apps claim the module's group, since nothing says which one draws it
 */
export function appFor(config: SimplixConfig, owner: PageOwner): string | undefined {
  if (owner.app !== undefined) return owner.app;
  const group = owner.moduleGroup;
  if (group === undefined) return undefined;
  const claiming = Object.entries(config.apps ?? {})
    .filter(([, one]) => one.moduleGroups?.includes(group))
    .map(([name]) => name)
    .sort();
  if (claiming.length > 1) {
    throw new Error(`simplix.config.ts: module group "${group}" is listed in the moduleGroups of apps ${claiming.join(", ")}; a group belongs to one app`);
  }
  return claiming[0];
}

/**
 * The template settings in force for an app: each key the app sets over the top-level key of the
 * same name, each key it leaves out taken from the top level.
 *
 * @param app the app from {@link appFor}; undefined reads the top-level settings alone
 */
export function templatesFor(config: SimplixConfig, app: string | undefined): SimplixTemplatesConfig {
  const top = config.templates ?? {};
  const own = app !== undefined ? config.apps?.[app]?.templates : undefined;
  if (own === undefined) return top;
  return {
    ...top,
    ...(own.from !== undefined ? { from: own.from } : {}),
    ...(own.storiesDir !== undefined ? { storiesDir: own.storiesDir } : {}),
    ...(own.story !== undefined ? { story: own.story } : {}),
  };
}

/**
 * The option a template setting is spelled as in `simplix.config.ts`, for an error to name.
 *
 * @param key the key under `templates`
 * @param app the app whose settings were read
 */
export function templatesOption(config: SimplixConfig, key: keyof SimplixTemplatesConfig, app: string | undefined): string {
  const own = app !== undefined ? config.apps?.[app]?.templates : undefined;
  return own?.[key] !== undefined ? `apps["${app}"].templates.${key}` : `templates.${key}`;
}

/** One directory generated stories are written to, with the naming its stories follow. */
export interface StoryTarget {
  /** The directory as configured, relative to the project root. */
  readonly storiesDir: string;
  readonly story: SimplixTemplatesConfig["story"];
}

/**
 * Every story directory the config names: the top-level one and each app's, once each, with the
 * story naming in force there.
 */
export function storyTargets(config: SimplixConfig): StoryTarget[] {
  const targets: StoryTarget[] = [];
  const add = (templates: SimplixTemplatesConfig): void => {
    if (!templates.storiesDir || targets.some((one) => one.storiesDir === templates.storiesDir)) return;
    targets.push({ storiesDir: templates.storiesDir, story: templates.story });
  };
  add(config.templates ?? {});
  for (const app of Object.keys(config.apps ?? {}).sort()) add(templatesFor(config, app));
  return targets;
}
