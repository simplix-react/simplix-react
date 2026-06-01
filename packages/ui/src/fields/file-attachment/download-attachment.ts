export interface DownloadAttachmentOptions {
  /** Server attachment id (used with fetchBlobUrl for the authenticated path). */
  attachmentId?: string
  /** Filename to save as. Falls back to "download". */
  fileName?: string
  /** Public direct URL, used only when no authenticated fetcher is available. */
  url?: string
  /** Authenticated blob fetcher (FileFieldApi.fetchBlobUrl). */
  fetchBlobUrl?: (attachmentId: string) => Promise<string>
}

/**
 * Saves an attachment to disk with its original filename.
 *
 * Prefers the authenticated blob path (Bearer-carrying fetchBlobUrl) so gated
 * files download for permitted users; falls back to the public `url` only when
 * no fetcher is provided. Uses an `<a download>` so the saved name is the real
 * filename, not the storage UUID. Best-effort: silently no-ops on fetch failure.
 */
export async function downloadAttachment({
  attachmentId,
  fileName,
  url,
  fetchBlobUrl,
}: DownloadAttachmentOptions): Promise<void> {
  const name = fileName ?? 'download'
  let href: string | undefined
  let isObjectUrl = false

  try {
    if (fetchBlobUrl && attachmentId) {
      href = await fetchBlobUrl(attachmentId)
      isObjectUrl = true
    } else if (url) {
      href = url
    }
  } catch {
    return
  }

  if (!href) return

  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = name
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  if (isObjectUrl) URL.revokeObjectURL(href)
}
