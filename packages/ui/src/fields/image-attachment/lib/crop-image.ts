/** Crop rectangle in natural (source) image pixels — matches CropModal onSave output. */
export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Crops source File to area using offscreen canvas.
 * Same name + mimeType as original (OQ-3): no format conversion.
 */
export function cropImageToFile(source: File, area: CropArea): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = area.width
      canvas.height = area.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get 2d canvas context'))
        return
      }
      ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('canvas.toBlob returned null'))
            return
          }
          resolve(new File([blob], source.name, { type: source.type }))
        },
        source.type,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for cropping'))
    }

    img.src = url
  })
}
