
import { CaptionPlugin } from '@platejs/caption/react'
import {
  ImagePlugin,
  PlaceholderPlugin,
} from '@platejs/media/react'
import { KEYS } from 'platejs'
import type { AnyPlatePlugin } from 'platejs/react'

import { ImageElement, PlaceholderElement } from '../components/image-node'
import { DEFAULT_MAX_IMAGE_SIZE, DEFAULT_ACCEPTED_IMAGE_FORMATS } from '../types'

/**
 * Image upload handler type
 */
export type ImageUploadHandler = (file: File) => Promise<string>

/**
 * Create media kit with custom upload handler
 */
export const createMediaKit = (options?: {
  uploadHandler?: ImageUploadHandler
  maxImageSize?: number
  acceptedFormats?: string[]
}): AnyPlatePlugin[] => {
  const {
    uploadHandler,
    maxImageSize = DEFAULT_MAX_IMAGE_SIZE,
    acceptedFormats = DEFAULT_ACCEPTED_IMAGE_FORMATS,
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
export const MediaKit: AnyPlatePlugin[] = createMediaKit()
