// Types
export type {
  AttachmentRecord,
  AttachmentOrderUpdate,
  AttachmentDescriptionUpdate,
  FileFieldApi,
  FileAttachmentItem,
  AttachmentStatus,
  FileFieldConfig,
  FileFieldProps,
  UseFileAttachmentReturn,
  ValidationErrorType,
} from './types'

// Hook
export { useFileAttachment } from './use-file-attachment'
export type { UseFileAttachmentOptions } from './use-file-attachment'

// Atoms
export { FileDropzone } from './atoms/file-dropzone'
export type { FileDropzoneProps } from './atoms/file-dropzone'

export { FileTypeIcon } from './atoms/file-type-icon'
export type { FileTypeIconProps } from './atoms/file-type-icon'

export { FileThumbnail } from './atoms/file-thumbnail'
export type { FileThumbnailProps } from './atoms/file-thumbnail'

export { UploadProgressBar } from './atoms/upload-progress-bar'
export type { UploadProgressBarProps } from './atoms/upload-progress-bar'

// Components
export { FileListItem } from './components/file-list-item'
export type { FileListItemProps } from './components/file-list-item'

export { FileSection } from './components/file-section'
export type { FileSectionProps } from './components/file-section'

export { FileActionButton } from './components/file-action-button'
export type { FileActionButtonProps, FileActionKind } from './components/file-action-button'

export { DescriptionEditDialog } from './components/description-edit-dialog'
export type { DescriptionEditDialogProps } from './components/description-edit-dialog'

export { ImageViewerModal } from './components/image-viewer-modal'
export type { ImageViewerModalProps } from './components/image-viewer-modal'

export { DeleteConfirmDialog } from './components/delete-confirm-dialog'
export type { DeleteConfirmDialogProps } from './components/delete-confirm-dialog'
