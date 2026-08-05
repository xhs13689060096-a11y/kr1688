import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: {
    singular: 'Comment',
    plural: 'Comments',
  },
  access: {
    create: authenticated,
    read: ({ req: { user } }) => {
      // Unauthenticated users can only see approved comments.
      // Authenticated users (admin in V1) can see all.
      if (user) return true
      return {
        status: {
          equals: 'approved',
        },
      }
    },
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'body',
    defaultColumns: ['body', 'author', 'story', 'chapter', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'body',
      type: 'richText',
      required: true,
      label: 'Comment Body',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      label: 'Author',
    },
    {
      name: 'story',
      type: 'relationship',
      relationTo: 'stories',
      hasMany: false,
      label: 'Story',
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
      hasMany: false,
      label: 'Chapter',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'comments',
      hasMany: false,
      label: 'Parent Comment',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Hidden', value: 'hidden' },
      ],
      defaultValue: 'pending',
      label: 'Status',
    },
    {
      name: 'moderationReason',
      type: 'textarea',
      label: 'Moderation Reason',
      admin: {
        description: 'Reason for the moderation decision.',
      },
    },
    {
      name: 'likeCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      label: 'Like Count',
      admin: {
        description: 'Admin-only field.',
        readOnly: true,
      },
    },
    {
      name: 'aiRecommendation',
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Approve', value: 'approve' },
        { label: 'Reject', value: 'reject' },
        { label: 'Flag for Review', value: 'flag_review' },
      ],
      defaultValue: 'none',
      label: 'AI Recommendation',
      admin: {
        description: 'Admin-only field.',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Ensure at least one of story or chapter is provided.
        if (!data?.story && !data?.chapter) {
          throw new Error(
            'A comment must be associated with either a story or a chapter.',
          )
        }
      },
    ],
    beforeChange: [
      ({ data, req }) => {
        // Auto-populate author from the authenticated user on create.
        if (!data?.author && req?.user) {
          data.author = req.user.id
        }
      },
    ],
  },
  timestamps: true,
}
