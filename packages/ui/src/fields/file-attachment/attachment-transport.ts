/**
 * Host-registered transport for attachment upload (with real progress) and
 * authenticated blob reads.
 *
 * The library stays HTTP-agnostic: the host registers an implementation backed
 * by its own auth stack (e.g. boot-auth's `uploadWithProgress` /
 * `fetchAttachmentBlob`, which carry the bearer token + 401 refresh-retry).
 * When nothing is registered, {@link createFileFieldApi} falls back to the
 * plain mutator (terminal progress, no authenticated blob).
 */
export interface AttachmentTransport {
  /** Multipart upload reporting 0–100 progress; resolves the unwrapped record. */
  upload?: <T = unknown>(
    url: string,
    formData: FormData,
    opts?: { onProgress?: (percent: number) => void; signal?: AbortSignal },
  ) => Promise<T>
  /** Authenticated blob fetch for download/thumbnail bytes. */
  fetchBlob?: (url: string) => Promise<Blob>
}

let registered: AttachmentTransport = {}

/** Register the host's attachment transport (call once at app boot). */
export function configureAttachmentTransport(transport: AttachmentTransport): void {
  registered = transport
}

/** The currently registered attachment transport (empty object if unset). */
export function getAttachmentTransport(): AttachmentTransport {
  return registered
}
