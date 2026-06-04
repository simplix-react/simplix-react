import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@simplix-react/i18n/react'
import { formatBytes } from '../../utils/format-bytes'
import {
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_FILE_SIZE,
} from './types'
import type {
  AttachmentDescriptionUpdate,
  AttachmentOrderUpdate,
  AttachmentRecord,
  AttachmentStatus,
  FileAttachmentItem,
  FileFieldApi,
  FileFieldConfig,
  UseFileAttachmentReturn,
  ValidationErrorType,
} from './types'

// ── Pure helpers ───────────────────────────────────────────────────────────────

function generateLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Routes 401/403 errors to onAuthError; re-throws everything else (R2-5/R2-6).
 * NEW helper — no matilo equivalent (matilo calls axios directly).
 */
function handleApiError(error: unknown, onAuthError?: (e: unknown) => void): void {
  const status =
    typeof error === 'object' && error !== null && 'response' in error
      ? (error as { response?: { status?: number } }).response?.status
      : undefined
  if (status === 401 || status === 403) {
    if (onAuthError) onAuthError(error)
    else console.warn('[FileField] Auth error (401/403). Provide an onAuthError prop.')
    return
  }
  throw error
}

/** Image classification used for preview creation and section sorting (UD-8). */
function isImageMime(mimeType: string | undefined): boolean {
  return !!mimeType?.startsWith('image/')
}

/**
 * Pure file validator — port of matilo use-attachment-upload.ts:73-118.
 * Returns the first violation, or null when the file is acceptable.
 */
function validateFile(
  file: File,
  config: FileFieldConfig,
  currentCount: number,
): ValidationErrorType | null {
  const maxSize =
    typeof config.maxFileSize === 'number' && config.maxFileSize >= 1024
      ? config.maxFileSize
      : DEFAULT_MAX_FILE_SIZE
  // Default to 10 when the host provides no count limit (issue 8: display + validation share the default).
  const maxAttachments =
    typeof config.maxAttachments === 'number' ? config.maxAttachments : DEFAULT_MAX_FILES

  if (currentCount >= maxAttachments) {
    return { type: 'maxAttachments', max: maxAttachments }
  }
  if (file.size > maxSize) {
    return { type: 'maxFileSize', maxMB: Math.round(maxSize / (1024 * 1024)) }
  }
  if (config.allowedExtensions && config.allowedExtensions.length > 0) {
    const parts = file.name.split('.')
    const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
    if (!config.allowedExtensions.map((e) => e.toLowerCase()).includes(ext)) {
      return { type: 'extension', ext }
    }
  }
  if (config.allowedMimeTypes && config.allowedMimeTypes.length > 0) {
    const matched = config.allowedMimeTypes.some((pattern) =>
      pattern.endsWith('/*')
        ? file.type.startsWith(pattern.slice(0, -1))
        : file.type === pattern,
    )
    if (!matched) return { type: 'mimeType', mimeType: file.type }
  }
  return null
}

// ── Hook interface ─────────────────────────────────────────────────────────────

export interface UseFileAttachmentOptions {
  /** Seed for internal state (DEC-1/UD-8). Hook does NOT call api.list() on mount. */
  initialAttachments: AttachmentRecord[]
  api: FileFieldApi
  config: FileFieldConfig
  onChange: (value: AttachmentRecord[]) => void
  onAuthError?: (error: unknown) => void
}

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Core state hook for FileField.
 *
 * NOTE (R2-3): NEW abstraction delegating all HTTP to props.api.*. NOT a copy
 * of matilo's inline-axios implementation. Only validateFile is a pure port.
 *
 * Invariants:
 *   DEC-1   — items seeded from initialAttachments; no api.list() on mount.
 *   R2-1/UD-2 — setRepresentative calls api.list() after success to re-sync.
 *   R2-2    — reorderItems uses optimistic splice + rollback on failure.
 *   UD-8    — image/file split via mimeType.startsWith('image/').
 */
export function useFileAttachment(options: UseFileAttachmentOptions): UseFileAttachmentReturn {
  const { initialAttachments, api, config, onChange, onAuthError } = options
  const { t } = useTranslation('simplix/ui')

  // ── State ──────────────────────────────────────────────────────────────────

  const [items, setItems] = useState<FileAttachmentItem[]>(() =>
    initialAttachments.map((attachment) => ({
      localId: attachment.attachmentId ?? generateLocalId(),
      attachment,
      progress: 100,
      status: 'completed' as AttachmentStatus,
    })),
  )
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // In-flight upload abort controllers, keyed by item localId. Aborting on remove/cancel
  // stops the HTTP request so no ACTIVE orphan is created — the backend treats the
  // incomplete upload as a cleanable UPLOADING orphan (daily orphan-cleanup scheduler).
  const uploadControllers = useRef<Map<string, AbortController>>(new Map())

  // ── Derived state ──────────────────────────────────────────────────────────

  const isUploading = useMemo(() => items.some((i) => i.status === 'uploading'), [items])
  const completedCount = useMemo(() => items.filter((i) => i.status === 'completed').length, [items])

  // ── Effects ────────────────────────────────────────────────────────────────

  // Emit completed-only attachments to onChange (matilo :251-256).
  useEffect(() => {
    onChange(
      items
        .filter((i) => i.status === 'completed' && i.attachment != null)
        .map((i) => i.attachment!),
    )
  }, [items, onChange])

  // Revoke preview object URLs on unmount (matilo :652-661).
  useEffect(() => {
    return () => {
      setItems((current) => {
        current.forEach((i) => { if (i.preview) URL.revokeObjectURL(i.preview) })
        return current
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Method 2: addFiles (matilo :318-398) ──────────────────────────────────

  const addFiles = useCallback(
    async (files: File[]): Promise<void> => {
      // All-or-nothing on count: if the whole batch would exceed the limit, reject it
      // entirely (upload nothing) so the user re-selects fewer files (no partial fill).
      const maxAttachments =
        typeof config.maxAttachments === 'number' ? config.maxAttachments : DEFAULT_MAX_FILES
      if (items.length + files.length > maxAttachments) {
        setValidationErrors([t('file.validation.maxAttachments', { max: maxAttachments })])
        return
      }

      const errors: string[] = []
      // Running total: all current items (any status) + files accepted so far in this batch.
      let acceptedInBatch = 0
      for (const file of files) {
        const currentCount = items.length + acceptedInBatch
        const err = validateFile(file, config, currentCount)
        if (err) {
          const maxSize =
            typeof config.maxFileSize === 'number' && config.maxFileSize >= 1024
              ? config.maxFileSize
              : DEFAULT_MAX_FILE_SIZE
          let message: string
          switch (err.type) {
            case 'maxAttachments':
              message = t('file.validation.maxAttachments', { max: err.max })
              break
            case 'maxFileSize':
              message = t('file.validation.maxFileSize', { size: formatBytes(maxSize) })
              break
            case 'extension':
              message = t('file.validation.extensionNotAllowed', { ext: err.ext })
              break
            case 'mimeType':
              message = t('file.validation.mimeNotAllowed', { mime: err.mimeType })
              break
            default:
              message = ''
          }
          errors.push(message)
          continue
        }
        acceptedInBatch++

        const localId = generateLocalId()
        const preview = isImageMime(file.type) ? URL.createObjectURL(file) : undefined
        const controller = new AbortController()
        uploadControllers.current.set(localId, controller)

        setItems((prev) => [
          ...prev,
          { localId, file, preview, progress: 0, status: 'pending' as AttachmentStatus },
        ])
        setItems((prev) =>
          prev.map((i) =>
            i.localId === localId ? { ...i, status: 'uploading' as AttachmentStatus } : i,
          ),
        )

        try {
          const attachment = await api.upload(
            file,
            (progress) => {
              setItems((prev) =>
                prev.map((i) => (i.localId === localId ? { ...i, progress } : i)),
              )
            },
            controller.signal,
          )
          setItems((prev) =>
            prev.map((i) =>
              i.localId === localId
                ? { ...i, attachment, progress: 100, status: 'completed' as AttachmentStatus, error: undefined }
                : i,
            ),
          )
        } catch (error) {
          // Aborted by the user (cancel/remove) — the row is already gone; don't flag an error.
          if (controller.signal.aborted) {
            // no-op
          } else {
            const serverMessage =
              typeof error === 'object' && error !== null && 'message' in error
                ? (error as { message?: string }).message
                : undefined
            const message = serverMessage ?? t('file.uploadFailed')
            setItems((prev) =>
              prev.map((i) =>
                i.localId === localId
                  ? { ...i, progress: 0, status: 'error' as AttachmentStatus, error: message }
                  : i,
              ),
            )
            try { handleApiError(error, onAuthError) } catch { /* reflected in item state */ }
          }
        } finally {
          uploadControllers.current.delete(localId)
        }
      }
      // Dedupe identical messages (e.g. one "max N files" per rejected overflow file).
      setValidationErrors([...new Set(errors)])
    },
    [api, config, items, onAuthError, t],
  )

  // ── Method 3: removeItem (matilo :403-436) ────────────────────────────────

  const removeItem = useCallback(
    async (localId: string): Promise<void> => {
      // Abort an in-flight upload for this row so the backend never finalizes it as ACTIVE
      // (the incomplete upload becomes a cleanable UPLOADING orphan instead).
      const controller = uploadControllers.current.get(localId)
      if (controller) {
        controller.abort()
        uploadControllers.current.delete(localId)
      }
      // Always remove from UI via the functional updater — never gate on a closure lookup
      // (a stale `items` could early-return and leave an in-flight upload row stuck). The
      // closure lookup below is best-effort cleanup metadata only.
      const item = items.find((i) => i.localId === localId)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      setItems((prev) => prev.filter((i) => i.localId !== localId))
      if (item?.attachment?.attachmentId) {
        try {
          await api.delete(item.attachment.attachmentId)
        } catch (error) {
          // Item already removed from UI (matilo :426-429); only handle auth errors.
          try { handleApiError(error, onAuthError) } catch { /* swallowed */ }
        }
      }
    },
    [api, items, onAuthError],
  )

  // ── Method 4: retryUpload (matilo :546-588) ───────────────────────────────

  const retryUpload = useCallback(
    async (localId: string): Promise<void> => {
      const item = items.find((i) => i.localId === localId)
      if (!item || item.status !== 'error' || !item.file) return

      setItems((prev) =>
        prev.map((i) =>
          i.localId === localId
            ? { ...i, status: 'uploading' as AttachmentStatus, progress: 0, error: undefined }
            : i,
        ),
      )
      try {
        const attachment = await api.upload(item.file, (progress) => {
          setItems((prev) => prev.map((i) => (i.localId === localId ? { ...i, progress } : i)))
        })
        setItems((prev) =>
          prev.map((i) =>
            i.localId === localId
              ? { ...i, attachment, progress: 100, status: 'completed' as AttachmentStatus, error: undefined }
              : i,
          ),
        )
      } catch (error) {
        const serverMessage =
          typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message?: string }).message
            : undefined
        const message = serverMessage ?? t('file.uploadFailed')
        setItems((prev) =>
          prev.map((i) =>
            i.localId === localId
              ? { ...i, progress: 0, status: 'error' as AttachmentStatus, error: message }
              : i,
          ),
        )
        try { handleApiError(error, onAuthError) } catch { /* reflected in item state */ }
      }
    },
    [api, items, onAuthError, t],
  )

  // ── Method 5: reorderItems (matilo :484-541) — R2-2 ─────────────────────

  const reorderItems = useCallback(
    async (fromIndex: number, toIndex: number): Promise<void> => {
      if (fromIndex === toIndex) return
      const snapshot = [...items]
      const reordered = [...items]
      const [moved] = reordered.splice(fromIndex, 1)
      reordered.splice(toIndex, 0, moved)
      setItems(reordered)
      if (!api.reorder) return

      const orders: AttachmentOrderUpdate[] = reordered
        .filter((i) => i.status === 'completed' && i.attachment?.attachmentId)
        .map((i, idx) => ({ attachmentId: i.attachment!.attachmentId!, sortOrder: idx }))

      try {
        await api.reorder(orders)
      } catch (error) {
        setItems(snapshot) // rollback (matilo :530-537)
        try { handleApiError(error, onAuthError) } catch { /* snapshot restored */ }
      }
    },
    [api, items, onAuthError],
  )

  // ── Method 6: updateDescription (matilo :441-479) ────────────────────────

  const updateDescription = useCallback(
    async (localId: string, dto: AttachmentDescriptionUpdate): Promise<void> => {
      if (!api.updateDescription) return
      const item = items.find((i) => i.localId === localId)
      if (!item?.attachment?.attachmentId) return
      try {
        const updated = await api.updateDescription(item.attachment.attachmentId, dto)
        setItems((prev) =>
          prev.map((i) => (i.localId === localId ? { ...i, attachment: updated } : i)),
        )
      } catch (error) {
        handleApiError(error, onAuthError)
      }
    },
    [api, items, onAuthError],
  )

  // ── Method 7: setRepresentative (matilo :623-650) — UD-2/R2-1 ───────────

  const setRepresentative = useCallback(
    async (localId: string): Promise<void> => {
      // Toggle semantics: clicking the current representative clears it (deselect → none).
      // A field may legitimately have no representative; consumers fall back to the first item.
      const target = items.find((i) => i.localId === localId)
      const willUnset = target?.attachment?.representative === true

      // Optimistic local toggle, visible immediately regardless of api support.
      setItems((prev) =>
        prev.map((i) => {
          if (!i.attachment) return i
          return {
            ...i,
            attachment: {
              ...i.attachment,
              representative: willUnset ? false : i.localId === localId,
            },
          }
        }),
      )

      if (!api.setRepresentative) return
      if (!target?.attachment?.attachmentId) return

      try {
        // One endpoint handles both directions: pass the desired state — set when selecting,
        // clear when deselecting (toggling the current representative off).
        await api.setRepresentative(target.attachment.attachmentId, !willUnset)
        // ★ UD-2 re-sync: rebuild items from authoritative server list (set + unset).
        // Prevents representative-duplication regression (R2-1).
        const refreshed = await api.list()
        setItems(
          refreshed.map((attachment) => ({
            localId: attachment.attachmentId ?? generateLocalId(),
            attachment,
            progress: 100,
            status: 'completed' as AttachmentStatus,
          })),
        )
      } catch (error) {
        handleApiError(error, onAuthError)
      }
    },
    [api, items, onAuthError],
  )

  // ── Method 8: getImageItems (matilo :593-602) — UD-8 ────────────────────

  const getImageItems = useCallback((): FileAttachmentItem[] => {
    return items.filter((i) =>
      i.file ? isImageMime(i.file.type) : isImageMime(i.attachment?.mimeType),
    )
  }, [items])

  // ── Method 9: getFileItems (matilo :607-616) — UD-8 ─────────────────────

  const getFileItems = useCallback((): FileAttachmentItem[] => {
    return items.filter((i) =>
      i.file ? !isImageMime(i.file.type) : !isImageMime(i.attachment?.mimeType),
    )
  }, [items])

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    items,
    isUploading,
    completedCount,
    validationErrors,
    addFiles,
    removeItem,
    retryUpload,
    reorderItems,
    updateDescription,
    setRepresentative,
    getImageItems,
    getFileItems,
  }
}
