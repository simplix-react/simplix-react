import { FileIcon, defaultStyles } from 'react-file-icon'
import type { FileIconProps } from 'react-file-icon'
import { cn } from '../../../utils/cn'

export interface FileTypeIconProps {
  /** Explicit extension (e.g. 'pdf'). Overrides mimeType/fileName derivation. */
  extension?: string
  /** MIME type used for extension fallback. */
  mimeType?: string
  /** File name used for extension fallback when extension/mimeType are absent. */
  fileName?: string
  /** Container size in pixels. Defaults to 36. */
  size?: number
  className?: string
}

/**
 * Resolves the lowercase file extension from available hints.
 * Priority: explicit extension > fileName suffix > mimeType heuristic.
 * Always returns lowercase (required by react-file-icon defaultStyles keys).
 */
function resolveExtension(
  extension?: string,
  mimeType?: string,
  fileName?: string,
): string {
  if (extension) return extension.toLowerCase()

  if (fileName) {
    const parts = fileName.split('.')
    if (parts.length > 1) return parts[parts.length - 1].toLowerCase()
  }

  if (mimeType) {
    if (mimeType.startsWith('image/')) {
      const sub = mimeType.split('/')[1]
      return (sub ?? 'jpg').toLowerCase()
    }
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType === 'application/zip' || mimeType === 'application/x-rar-compressed') return 'zip'
    if (mimeType === 'application/msword' || mimeType.includes('wordprocessingml')) return 'docx'
    if (mimeType.includes('spreadsheetml') || mimeType === 'application/vnd.ms-excel') return 'xlsx'
  }

  return 'txt'
}

/**
 * File type icon atom using react-file-icon glyph only.
 *
 * ★ UD-1: NO 4-tone background (plan §5.2, FX-3).
 * Uses a single neutral bg-muted container for all file types.
 * The tone/color information lives in the glyph itself via defaultStyles.
 */
export function FileTypeIcon({
  extension,
  mimeType,
  fileName,
  size = 36,
  className,
}: FileTypeIconProps) {
  const ext = resolveExtension(extension, mimeType, fileName)
  const styles = (defaultStyles as Record<string, Partial<FileIconProps>>)[ext] ?? {}

  return (
    <div
      className={cn(
        'grid place-items-center rounded-sm bg-muted',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div style={{ width: size * 0.5, height: size * 0.5 }}>
        <FileIcon extension={ext} {...styles} />
      </div>
    </div>
  )
}
