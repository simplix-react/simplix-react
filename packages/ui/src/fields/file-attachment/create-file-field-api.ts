import { getMutator } from '@simplix-react/api'
import { getAttachmentTransport } from './attachment-transport'
import type { AttachmentRecord, FileFieldApi, FileFieldSource } from './types'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Builds a {@link FileFieldApi} for the standard per-module attachment endpoints.
 *
 * The screen passes only its module attachment address ({@link FileFieldSource});
 * this wires the uniform endpoint shape
 *
 *   {basePath}/{id}/attachment/{group}/{op}
 *
 * where `{id}` is the saved `entityId`, or `TEMP_<tempEntityId>` for a pre-save
 * upload the backend links on create.
 *
 * JSON ops (list/delete/reorder/representative/description) go through the
 * host-registered mutator (default strategy `"boot"`). Upload and blob reads use
 * the host-registered {@link AttachmentTransport} when present — giving real
 * upload progress and authenticated blob bytes — and fall back to the mutator
 * (terminal progress, public `url`) otherwise.
 */
export function createFileFieldApi(source: FileFieldSource): FileFieldApi {
  const { basePath, group, entityId, tempEntityId, strategy = 'boot', authenticatedBlob, publicUrlBuilder, onMutated } = source
  const id = entityId ?? `TEMP_${tempEntityId}`
  const base = `${basePath}/${id}/attachment/${group}`
  const transport = getAttachmentTransport()

  const mapRecord = (rec: AttachmentRecord): AttachmentRecord => {
    if (!publicUrlBuilder || !rec.attachmentId) return rec
    const url = publicUrlBuilder(group, rec.attachmentId)
    const thumbnailUrl = publicUrlBuilder(group, rec.attachmentId, { thumbnail: true })
    return {
      ...rec,
      ...(url !== undefined ? { url } : {}),
      ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
    }
  }

  return {
    async upload(file, onProgress, signal) {
      const form = new FormData()
      form.append('file', file)
      if (transport.upload) {
        const record = await transport.upload<AttachmentRecord>(`${base}/upload`, form, { onProgress, signal })
        onMutated?.()
        return mapRecord(record)
      }
      const record = await getMutator(strategy)<AttachmentRecord>(`${base}/upload`, {
        method: 'POST',
        body: form,
        signal,
      })
      onProgress?.(100)
      onMutated?.()
      return mapRecord(record)
    },
    async list() {
      const records = await getMutator(strategy)<AttachmentRecord[]>(`${base}/list`, {
        method: 'GET',
      })
      return Array.isArray(records) ? records.map(mapRecord) : []
    },
    async delete(attachmentId) {
      await getMutator(strategy)(`${base}/${attachmentId}`, { method: 'DELETE' })
      onMutated?.()
    },
    async reorder(orders) {
      await getMutator(strategy)(`${base}/order`, {
        method: 'PATCH',
        headers: JSON_HEADERS,
        body: JSON.stringify({ orders }),
      })
      onMutated?.()
    },
    async setRepresentative(attachmentId, representative) {
      await getMutator(strategy)(
        `${base}/${attachmentId}/representative?representative=${representative}`,
        { method: 'PATCH' },
      )
      onMutated?.()
    },
    async updateDescription(attachmentId, dto) {
      const record = await getMutator(strategy)<AttachmentRecord>(`${base}/${attachmentId}`, {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify(dto),
      })
      onMutated?.()
      return mapRecord(record)
    },
    ...(authenticatedBlob && transport.fetchBlob && !publicUrlBuilder
      ? {
          async fetchBlobUrl(attachmentId: string, opts?: { thumbnail?: boolean; size?: number }) {
            const url = opts?.thumbnail
              ? `${base}/${attachmentId}/thumbnail?width=${opts.size ?? 128}&height=${opts.size ?? 128}`
              : `${base}/${attachmentId}/download`
            return URL.createObjectURL(await transport.fetchBlob!(url))
          },
        }
      : {}),
  }
}
