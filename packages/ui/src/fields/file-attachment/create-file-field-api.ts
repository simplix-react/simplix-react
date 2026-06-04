import type { AttachmentRecord, FileFieldApi } from './types'

/**
 * Minimal HTTP client surface required by {@link createFileFieldApi}, satisfied
 * structurally by an axios instance. Kept local so the library takes NO axios
 * dependency (consistent with file-attachment's HTTP-agnostic design); the host
 * injects its own configured client carrying auth headers and the
 * SimpliXApiResponse unwrapping interceptor.
 */
export interface AttachmentHttpClient {
  post(
    url: string,
    data: FormData,
    config?: {
      signal?: AbortSignal
      onUploadProgress?: (event: { loaded: number; total?: number }) => void
    },
  ): Promise<{ data: { body?: unknown } }>
  get(
    url: string,
    config?: { params?: Record<string, unknown>; responseType?: 'blob' },
  ): Promise<{ data: unknown }>
  delete(url: string): Promise<unknown>
  patch(
    url: string,
    data?: unknown,
    config?: { params?: Record<string, unknown> },
  ): Promise<{ data: { body?: unknown } }>
}

/**
 * Options for {@link createFileFieldApi}. The calling screen supplies the entity
 * coordinates and its own permission key; upload/list go to the common
 * attachment endpoints, which check that key server-side. Reorder / description /
 * representative / blob reads use the common attachmentId-keyed endpoints.
 */
export interface CreateFileFieldApiOptions {
  /** Host HTTP client (e.g. the app's configured axios instance). */
  http: AttachmentHttpClient
  /** Owning entity type, e.g. "Popup". */
  entityType: string
  /** Owning entity id (permanent), or the temp id when {@link temp} is true. */
  entityId: string
  /** Attachment group/slot, e.g. "banner". */
  group: string
  /** Permission key of the calling screen, e.g. "ADMIN_CMS_POPUP". */
  permissionKey: string
  /** Use the pre-save temp upload endpoint (UPLOADING) instead of the immediate one. */
  temp?: boolean
}

/** Base path of the common attachment API (server prefixes /api/v1). */
const COMMON_BASE = '/api/v1/files/attachments'

/**
 * Builds a {@link FileFieldApi} backed by the common attachment endpoints. The
 * caller passes only entityType + entityId + group + permissionKey; this wires
 * upload/list/delete and the shared metadata operations.
 */
export function createFileFieldApi(options: CreateFileFieldApiOptions): FileFieldApi {
  const { http, entityType, entityId, group, permissionKey, temp = false } = options

  const buildMetadata = () => ({
    entityType,
    attachmentGroup: group,
    permissionKey,
    ...(temp ? { tempEntityId: entityId } : { entityId }),
  })

  return {
    async upload(file, onProgress, signal) {
      const form = new FormData()
      form.append('file', file)
      form.append('metadata', new Blob([JSON.stringify(buildMetadata())], { type: 'application/json' }))
      const url = temp ? `${COMMON_BASE}/temp/upload` : `${COMMON_BASE}/upload`
      const res = await http.post(url, form, {
        signal,
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100))
          }
        },
      })
      return res.data.body as AttachmentRecord
    },
    async list() {
      const res = await http.get(COMMON_BASE, {
        params: { entityType, entityId, group, permissionKey },
      })
      return ((res.data as { body?: AttachmentRecord[] }).body ?? []) as AttachmentRecord[]
    },
    async delete(attachmentId) {
      // attachmentId-keyed: permission derived from the stored entity (no key sent).
      await http.delete(`${COMMON_BASE}/${attachmentId}`)
    },
    async reorder(orders) {
      await http.patch(`${COMMON_BASE}/order`, { orders })
    },
    async setRepresentative(attachmentId, representative) {
      await http.patch(`${COMMON_BASE}/${attachmentId}/representative`, null, {
        params: { representative },
      })
    },
    async updateDescription(attachmentId, dto) {
      const res = await http.patch(`${COMMON_BASE}/${attachmentId}/description`, dto)
      return res.data.body as AttachmentRecord
    },
    async fetchBlobUrl(attachmentId, opts) {
      if (opts?.thumbnail) {
        const size = opts.size ?? 128
        const res = await http.get(`${COMMON_BASE}/${attachmentId}/thumbnail`, {
          params: { width: size, height: size },
          responseType: 'blob',
        })
        return URL.createObjectURL(res.data as Blob)
      }
      const res = await http.get(`${COMMON_BASE}/${attachmentId}/content`, {
        responseType: 'blob',
      })
      return URL.createObjectURL(res.data as Blob)
    },
  }
}
