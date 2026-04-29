
import { CaptionPlugin } from '@platejs/caption/react'
import {
  ImagePlugin,
  PlaceholderPlugin,
} from '@platejs/media/react'
import { KEYS } from 'platejs'

import { ImageElement, PlaceholderElement } from '../components/image-node'

/**
 * Image upload handler type
 */
export type ImageUploadHandler = (file: File) => Promise<string>

/**
 * Create media kit with custom upload handler
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createMediaKit = (options?: {
  uploadHandler?: ImageUploadHandler
  maxImageSize?: number
  acceptedFormats?: string[]
}): any[] => {
  const {
    uploadHandler,
    maxImageSize = 5 * 1024 * 1024, // 5MB default
    acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options || {}

  return [
    ImagePlugin.configure({
      options: {
        disableUploadInsert: !uploadHandler,
        uploadImage: uploadHandler
          ? async (dataUrl: string | ArrayBuffer) => {
              // Convert dataUrl to File
              if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
                const response = await fetch(dataUrl)
                const blob = await response.blob()
                const file = new File([blob], 'image', { type: blob.type })

                // Validate file size
                if (file.size > maxImageSize) {
                  throw new Error(`Image size exceeds ${maxImageSize / 1024 / 1024}MB limit`)
                }

                // Validate format
                if (!acceptedFormats.includes(file.type)) {
                  throw new Error(`Invalid image format. Accepted: ${acceptedFormats.join(', ')}`)
                }

                return await uploadHandler(file)
              }
              return dataUrl
            }
          : undefined,
      },
      render: {
        node: ImageElement,
      },
    }),
    PlaceholderPlugin.configure({
      options: {
        disableEmptyPlaceholder: true,
      },
      render: {
        node: PlaceholderElement,
      },
    }),
    CaptionPlugin.configure({
      options: {
        query: {
          allow: [KEYS.img],
        },
      },
    }),
  ]
}

/**
 * Default media kit without upload handler
 * Images can only be embedded via URL
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MediaKit: any[] = createMediaKit()
