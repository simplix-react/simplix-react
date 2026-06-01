import { useEffect, useState } from 'react'

export interface ResolvedImageSrcOptions {
  /** Local object URL for a not-yet-uploaded file; takes precedence. */
  preview?: string
  /** Server attachment id (used with fetchBlobUrl). */
  attachmentId?: string
  /** Public direct URL; used when no authenticated fetcher is provided. */
  fallbackUrl?: string
  /** Authenticated blob fetcher (FileFieldApi.fetchBlobUrl). */
  fetchBlobUrl?: (
    attachmentId: string,
    opts?: { thumbnail?: boolean; size?: number },
  ) => Promise<string>
  /** Request the low-res thumbnail variant instead of full content. */
  thumbnail?: boolean
  /** Thumbnail pixel size (width/height). Larger = sharper preview, still low-res vs original. */
  size?: number
}

/**
 * Resolves the <img> src for an attachment.
 *
 * Priority: local preview → authenticated blob (fetchBlobUrl) → public fallbackUrl.
 * When a blob is fetched, its object URL is revoked on cleanup to avoid leaks.
 */
export function useResolvedImageSrc({
  preview,
  attachmentId,
  fallbackUrl,
  fetchBlobUrl,
  thumbnail,
  size,
}: ResolvedImageSrcOptions): string | undefined {
  const [src, setSrc] = useState<string | undefined>(preview ?? fallbackUrl)

  useEffect(() => {
    if (preview) {
      setSrc(preview)
      return
    }
    if (fetchBlobUrl && attachmentId) {
      let cancelled = false
      let objectUrl: string | undefined
      fetchBlobUrl(attachmentId, { thumbnail, size })
        .then((url) => {
          if (cancelled) {
            URL.revokeObjectURL(url)
            return
          }
          objectUrl = url
          setSrc(url)
        })
        .catch(() => {
          if (!cancelled) setSrc(fallbackUrl)
        })
      return () => {
        cancelled = true
        if (objectUrl) URL.revokeObjectURL(objectUrl)
      }
    }
    setSrc(fallbackUrl)
  }, [preview, attachmentId, fallbackUrl, fetchBlobUrl, thumbnail, size])

  return src
}
