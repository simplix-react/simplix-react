/** `templates.story` as the config states it: the frame's id and title patterns, and its file names. */
export interface StoryNaming {
  readonly id?: string;
  readonly title?: string;
  /**
   * The story file a scaffold key writes, relative to `templates.storiesDir`: an entity's kebab
   * name for `scaffold`, the default file name without `.stories.tsx` for `add-page`.
   */
  readonly files?: Readonly<Record<string, string>>;
}

const STORY_SUFFIX = ".stories.tsx";

/**
 * The file a generated story is written to: the one `templates.story.files` names for the key,
 * else the default.
 *
 * <p>The mapping exists for a board that already draws the screen under a name of its own: without
 * it a scaffold lays a second frame down beside the first, and the board then has two frames for
 * one screen that drift apart.
 *
 * @param naming `templates.story` from the project's config
 * @param key the entity's kebab name, or a page story's default file name without its suffix
 * @param fallback the file name used when the config names none
 * @throws Error when the configured name is not a `.stories.tsx` file inside the stories directory
 */
export function storyFileFor(naming: StoryNaming | undefined, key: string, fallback: string): string {
  const named = naming?.files?.[key];
  if (named === undefined) return fallback;
  if (!named.endsWith(STORY_SUFFIX) || named.split(/[\\/]/).some((part) => part === ".." || part === "")) {
    throw new Error(
      `templates.story.files["${key}"] is "${named}": it must name a ${STORY_SUFFIX} file inside templates.storiesDir.`,
    );
  }
  return named;
}

/** The scaffold key `templates.story.files` maps to this file name, when it maps one. */
export function storyKeyFor(naming: StoryNaming | undefined, file: string): string | undefined {
  const keys = Object.entries(naming?.files ?? {}).filter(([, named]) => named === file).map(([key]) => key);
  return keys.length === 1 ? keys[0] : undefined;
}
