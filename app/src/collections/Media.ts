import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { createFolderField } from 'payload'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            {
              name: 'alt',
              type: 'text',
            },
            createFolderField({ relationTo: 'folders' }),
            {
              name: 'caption',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
                },
              }),
            },
          ],
        },
        {
          label: 'R2 & Rights',
          fields: [
            {
              name: 'altAr',
              type: 'text',
              label: 'Arabic Alt Text',
            },
            {
              name: 'mediaType',
              type: 'select',
              defaultValue: 'image',
              options: [
                { label: 'Cover', value: 'cover' },
                { label: 'Audio', value: 'audio' },
                { label: 'Video', value: 'video' },
                { label: 'EPUB', value: 'epub' },
                { label: 'Image', value: 'image' },
              ],
              label: 'Media Type',
            },
            {
              name: 'rightsStatus',
              type: 'select',
              defaultValue: 'unknown',
              options: [
                { label: 'Unknown', value: 'unknown' },
                { label: 'Reviewing', value: 'reviewing' },
                { label: 'Cleared', value: 'cleared' },
                { label: 'Restricted', value: 'restricted' },
                { label: 'Expired', value: 'expired' },
                { label: 'Rejected', value: 'rejected' },
              ],
              label: 'Rights Status',
            },
            {
              name: 'sourceUrl',
              type: 'text',
              label: 'Source URL',
            },
            {
              name: 'sourceLabel',
              type: 'text',
              label: 'Source Label',
              admin: {
                description: 'e.g., Unsplash, Pexels, Custom',
              },
            },
            {
              name: 'demoOnly',
              type: 'checkbox',
              defaultValue: false,
              label: 'Demo Only',
              admin: {
                description: 'Mark this media as demo data, not for production use',
              },
            },
            {
              name: 'provider',
              type: 'select',
              defaultValue: 'local',
              options: [
                { label: 'Local', value: 'local' },
                { label: 'R2', value: 'r2' },
              ],
              label: 'Storage Provider',
              admin: {
                description: 'Storage provider for this media file',
              },
            },
          ],
        },
      ],
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
