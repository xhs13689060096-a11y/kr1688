import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownerOrAdmin } from '../access/ownerOrAdmin'

export const ReadingProgress: CollectionConfig = {
  slug: 'reading-progress',
  labels: {
    singular: 'Reading Progress',
    plural: 'Reading Progress',
  },
  access: {
    create: authenticated,
    read: ownerOrAdmin,
    update: ownerOrAdmin,
    delete: ownerOrAdmin,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'story', 'progressPercentage', 'completed', 'lastReadAt'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      label: 'User',
    },
    {
      name: 'story',
      type: 'relationship',
      relationTo: 'stories',
      required: true,
      hasMany: false,
      label: 'Story',
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
      hasMany: false,
      label: 'Current Chapter',
    },
    {
      name: 'progressPercentage',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      label: 'Progress Percentage',
      admin: {
        description: 'Reading progress as a percentage (0–100)',
      },
    },
    {
      name: 'lastReadAt',
      type: 'date',
      label: 'Last Read At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
      label: 'Completed',
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ req, data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          const userId = typeof data?.user === 'object' ? data.user.id : data?.user
          const storyId = typeof data?.story === 'object' ? data.story.id : data?.story

          if (userId && storyId) {
            const existing = await req.payload.find({
              collection: 'reading-progress',
              where: {
                and: [
                  { user: { equals: userId } },
                  { story: { equals: storyId } },
                ],
              },
            })

            if (existing.totalDocs > 0) {
              const duplicate = existing.docs.some(
                (doc) => !data?.id || doc.id !== data.id,
              )
              if (duplicate || operation === 'create') {
                throw new Error(
                  'A reading progress record already exists for this user and story.',
                )
              }
            }
          }
        }
      },
    ],
  },
  timestamps: true,
}
