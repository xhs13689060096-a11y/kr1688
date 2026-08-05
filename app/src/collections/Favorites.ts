import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { ownerOrAdmin } from '../access/ownerOrAdmin'

export const Favorites: CollectionConfig = {
  slug: 'favorites',
  labels: {
    singular: 'Favorite',
    plural: 'Favorites',
  },
  access: {
    create: authenticated,
    read: ownerOrAdmin,
    update: ownerOrAdmin,
    delete: ownerOrAdmin,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'story', 'createdAt'],
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
  ],
  hooks: {
    beforeValidate: [
      async ({ req, data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          const userId = typeof data?.user === 'object' ? data.user.id : data?.user
          const storyId = typeof data?.story === 'object' ? data.story.id : data?.story

          if (userId && storyId) {
            const existing = await req.payload.find({
              collection: 'favorites',
              where: {
                and: [
                  { user: { equals: userId } },
                  { story: { equals: storyId } },
                ],
              },
            })

            // On create: fail if any existing record found
            // On update: fail if another record (different ID) exists
            if (existing.totalDocs > 0) {
              const duplicate = existing.docs.some(
                                (doc) => !data?.id || doc.id !== data.id,
              )
              if (duplicate || operation === 'create') {
                throw new Error(
                  'A favorite record already exists for this user and story.',
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
