import type { LocaleConfig } from '@simplix-react/i18n'
import type { CommonFieldProps } from '../../crud/shared/types'

/**
 * Loose base record for an attachment returned by the server.
 * [key: string]: unknown allows free extension fields without casting.
 */
export interface AttachmentRecord {
  attachmentId?: string
  originalName?: string
  fileSize?: number
  mimeType?: string
  url?: string
  thumbnailUrl?: string
  /**
   * Attachment item meta description.
   * NOTE (R3-2): this is NOT the same as CommonFieldProps.description (field help text).
   */
  description?: string
  descriptionI18n?: Record<string, string>
  representative?: boolean
  sortOrder?: number
  width?: number
  height?: number
  [key: string]: unknown
}

/** Payload for a reorder API call — one entry per completed attachment. */
export interface AttachmentOrderUpdate {
  attachmentId: string
  sortOrder: number
}

/** Payload for an updateDescription API call. */
export interface AttachmentDescriptionUpdate {
  description?: string
  descriptionI18n?: Record<string, string>
}

/**
 * API surface the caller must provide.
 * NOTE (R2-3): this is a NEW abstraction — NOT a port of matilo AttachmentApiOperations.
 * Only the caller's implementation calls the actual HTTP layer; the hook calls props.api.*.
 *
 * list() is required (used for setRepresentative re-sync per UD-2/R2-1).
 * reorder / updateDescription / setRepresentative are optional — hook no-ops when absent.
 */
export interface FileFieldApi {
  upload: (
    file: File,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal,
  ) => Promise<AttachmentRecord>
  list: () => Promise<AttachmentRecord[]>
  delete: (attachmentId: string) => Promise<void>
  reorder?: (orders: AttachmentOrderUpdate[]) => Promise<void>
  updateDescription?: (attachmentId: string, dto: AttachmentDescriptionUpdate) => Promise<AttachmentRecord>
  setRepresentative?: (attachmentId: string, representative: boolean) => Promise<void>
  /**
   * Fetches an authenticated object URL for an attachment's bytes.
   * Provide this when the file URL is permission-gated (Bearer auth) so the
   * field can display/download it via blob instead of a direct, unauthenticated
   * <img src>. Pass `{ thumbnail: true }` to fetch a small thumbnail (list rows)
   * instead of the full content (viewer / download). When omitted, the field
   * falls back to the record's public `url`.
   */
  fetchBlobUrl?: (
    attachmentId: string,
    opts?: { thumbnail?: boolean; size?: number },
  ) => Promise<string>
}

/** Upload lifecycle state for a single item in the hook's internal list. */
export type AttachmentStatus = 'pending' | 'uploading' | 'completed' | 'error'

/**
 * Internal item model managed by useFileAttachment.
 * Mirrors matilo AttachmentFileItem (types.ts:48-69).
 */
export interface FileAttachmentItem {
  /** Stable client-side key, never sent to server. */
  localId: string
  /** Present for items that haven't been uploaded yet. */
  file?: File
  /** Object URL created pre-upload for image preview; revoked on unmount. */
  preview?: string
  /** Present once the server returns a record (status === 'completed'). */
  attachment?: AttachmentRecord
  /** Upload progress 0-100. */
  progress: number
  status: AttachmentStatus
  /** Human-readable error message when status === 'error'. */
  error?: string
}

/**
 * Component-internal defaults applied when the host provides no config.
 * Single source for both display (dropzone labels) and validation (the hook).
 */
export const DEFAULT_MAX_FILES = 10
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024

/** Resolves the effective max file size, falling back to the default when unset or < 1024 (UD-8). */
export function resolveMaxFileSize(config?: { maxFileSize?: number }): number {
  return config?.maxFileSize && config.maxFileSize >= 1024 ? config.maxFileSize : DEFAULT_MAX_FILE_SIZE
}

/** Per-field capacity / MIME constraints. */
export interface FileFieldConfig {
  maxAttachments?: number
  /**
   * Maximum allowed file size in bytes.
   * When unset or < 1024 the hook falls back to 10 MB (UD-8).
   */
  maxFileSize?: number
  /** Allowed file extensions, e.g. ['pdf', 'docx']. Case-insensitive. */
  allowedExtensions?: string[]
  /** Allowed MIME types or wildcards, e.g. ['image/*', 'application/pdf']. */
  allowedMimeTypes?: string[]
}

/**
 * Props for the FileField form component.
 * Extends CommonFieldProps (label, error, disabled, layout, size, etc.).
 *
 * NOTE (DEC-1/UD-8): initialAttachments is the SINGLE init path — the hook
 * does NOT call api.list() on mount. Callers pre-fetch and pass the list here.
 */
export interface FileFieldProps extends CommonFieldProps {
  /** Controlled list of completed attachments (server records). */
  value: AttachmentRecord[]
  /** Called whenever the completed attachment list changes. */
  onChange: (value: AttachmentRecord[]) => void
  /** Called when an API call returns 401 or 403 (R2-5/R2-6). */
  onAuthError?: (error: unknown) => void
  /**
   * Seed for the hook's internal items state (DEC-1/UD-8).
   * Pass the pre-fetched attachment list from the server here.
   * The hook will NOT call api.list() on mount.
   */
  initialAttachments?: AttachmentRecord[]
  /** API implementation provided by the caller. */
  api: FileFieldApi
  /** Capacity / MIME constraints. */
  config?: FileFieldConfig
  /**
   * Supported locale list for the i18n description dialog.
   * When omitted the dialog renders a single plain-text input.
   */
  languages?: LocaleConfig[]
}

/** Return value of useFileAttachment. */
export interface UseFileAttachmentReturn {
  items: FileAttachmentItem[]
  /** True while any item is in 'uploading' state. */
  isUploading: boolean
  /** Count of items with status === 'completed'. */
  completedCount: number
  /** Validation errors from the last addFiles() call. */
  validationErrors: string[]
  addFiles: (files: File[]) => Promise<void>
  removeItem: (localId: string) => Promise<void>
  retryUpload: (localId: string) => Promise<void>
  reorderItems: (fromIndex: number, toIndex: number) => Promise<void>
  updateDescription: (localId: string, dto: AttachmentDescriptionUpdate) => Promise<void>
  setRepresentative: (localId: string) => Promise<void>
  /** Items whose MIME type starts with 'image/' (UD-8). */
  getImageItems: () => FileAttachmentItem[]
  /** Items whose MIME type does NOT start with 'image/' (UD-8). */
  getFileItems: () => FileAttachmentItem[]
}

/** Discriminated union for validation errors returned by validateFile. */
export type ValidationErrorType =
  | { type: 'maxAttachments'; max: number }
  | { type: 'maxFileSize'; maxMB: number }
  | { type: 'extension'; ext: string }
  | { type: 'mimeType'; mimeType: string }
