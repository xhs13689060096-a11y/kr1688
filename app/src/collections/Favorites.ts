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
      ({ req, data, operation }) => {
        // Always derive user from authenticated request — reject spoofing
        if (!req.user) {
          throw new Error('Authentication required.')
        }
        data.user = req.user.id

        if (operation === 'create' || operation === 'update') {
          const storyId = typeof data?.story === 'object' ? data.story.id : data?.story

          if (storyId) {
            // Use req.payload via closure: hooks receive req.payload
            const checkDuplicate = async () => {
              const existing = await req.payload.find({
                collection: 'favorites',
                where: {
                  and: [
                    { user: { equals: req.user.id } },
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
                    'A favorite record already exists for this user and story.',
                  )
                }
              }
            }
            return checkDuplicate()
          }
        }
      },
    ],
  },
  timestamps: true,
}
