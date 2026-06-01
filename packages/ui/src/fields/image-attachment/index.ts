// Components
export { Carousel } from './components/carousel'
export type { CarouselProps, InfoBadgeMeta, CarouselStatus } from './components/carousel'
export { ThumbStrip } from './components/thumb-strip'
export type { ThumbStripProps, ThumbItem, ThumbState } from './components/thumb-strip'
export { StageDropzone } from './components/stage-dropzone'
export type { StageDropzoneProps } from './components/stage-dropzone'
export { CropModal } from './components/crop-modal'
export type { CropModalProps, CropArea } from './components/crop-modal'
// Atoms
export { EmptyPlaceholder } from './atoms/empty-placeholder'
export type { EmptyPlaceholderProps } from './atoms/empty-placeholder'
// Lib — W2 spec function name (plan §13-2): cropImageToFile + CropArea single source = lib/crop-image
export { cropImageToFile } from './lib/crop-image'
export type { CropArea as CropAreaType } from './lib/crop-image'
