import { cn } from "../../utils/cn";

/** Props for the {@link MediaEmbed} component. */
export interface MediaEmbedProps {
  /**
   * `video` renders a native player for a self-hosted stream (playback-end
   * observable); `frame` embeds an external player or document viewer.
   */
  kind: "video" | "frame";
  /** Media/document source URL. */
  src: string;
  /** Accessible title for the embedded frame. */
  title?: string;
  /** Fires when a `video` finishes playing (completion tracking). */
  onEnded?: () => void;
  /** Frame height in CSS pixels; `video`/16:9 frames size themselves. Defaults to 384 for document frames. */
  height?: number;
  /** Render `frame` at a 16:9 aspect (external video embeds); defaults to false. */
  widescreen?: boolean;
  className?: string;
}

/**
 * Bordered media container for in-app content: a native video player for
 * self-hosted streams or an iframe for external embeds and document viewers.
 * Centralizes the border/rounding/aspect handling so call sites never place
 * raw `<video>`/`<iframe>` tags.
 *
 * @example
 * ```tsx
 * <MediaEmbed kind="video" src={signedUrl} onEnded={markWatched} />
 * <MediaEmbed kind="frame" src={youtubeEmbedUrl} widescreen />
 * ```
 */
export function MediaEmbed({
  kind,
  src,
  title,
  onEnded,
  height,
  widescreen = false,
  className,
}: MediaEmbedProps) {
  if (kind === "video") {
    return (
      <video
        src={src}
        controls
        playsInline
        onEnded={onEnded}
        className={cn("w-full rounded-md border", className)}
        style={height ? { height } : undefined}
      />
    );
  }
  return (
    <iframe
      src={src}
      title={title}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      className={cn("w-full rounded-md border", widescreen && "aspect-video", className)}
      style={!widescreen ? { height: height ?? 384 } : undefined}
    />
  );
}
