/**
 * Per-usage server thumbnail request sizes (px) and animation handling.
 *
 * Aligned to the backend's predefined thumbnail size set
 * {64, 128, 256, 512, 1024} so each request maps to a cached size without
 * wasteful up-snapping.
 *   - THUMB_STRIP / DETAIL_ROW: small static thumbnails (many shown at once)
 *   - CAROUSEL_SCENE: mid-size preview for the active slide
 *   - PREVIEW_MODAL: large preview in the image viewer
 *
 * Single source for these sizes — imported by both image-field (carousel /
 * preview / detail row) and thumb-strip.
 */
export const THUMB_STRIP_SIZE = 128
export const DETAIL_ROW_SIZE = 128
export const CAROUSEL_SCENE_SIZE = 512
export const PREVIEW_MODAL_SIZE = 1024

/** MIME types whose animation must be preserved by serving the original. */
const ANIMATED_PREVIEW_MIME = new Set(['image/gif', 'image/webp'])

/**
 * Whether the carousel/preview should serve the original (instead of a static
 * thumbnail) to keep the animation. Animated GIF/WebP lose their animation when
 * rasterized into a thumbnail, so the slide and the viewer use the original.
 */
export function shouldServeOriginal(mimeType?: string): boolean {
  return mimeType != null && ANIMATED_PREVIEW_MIME.has(mimeType.toLowerCase())
}
