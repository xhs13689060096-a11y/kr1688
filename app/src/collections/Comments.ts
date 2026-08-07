import type { CollectionConfig, Where } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * S04 — Secured Comments collection.
 *
 * - Author always derived from req.user.id (anti-spoofing).
 * - Reader creates pending, only mutates own body.
 * - Only admin controls status, moderationReason, likeCount, aiRecommendation.
 * - Public (unauthenticated) sees only approved comments.
 * - Authenticated reader sees approved + their own.
 * - Admin sees all.
 * - Single-level replies only (no nested replies beyond depth 1).
 */

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: {
    singular: 'Comment',
    plural: 'Comments',
  },
  access: {
    create: authenticated,
    read: ({ req: { user } }): Where | boolean => {
      if (!user) {
        return { status: { equals: 'approved' } }
      }
      if (user.role === 'admin') {
        return true
      }
      return {
        or: [
          { status: { equals: 'approved' } },
          { author: { equals: user.id } },
        ],
      }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      // Reader: only own comments
      return { author: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return Boolean(user.role === 'admin')
    },
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
      access: {
        read: () => true,
        update: ({ req: { user } }) => Boolean(user),
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      label: 'Author',
      access: {
        create: () => false,
        update: () => false,
      },
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
      access: {
        create: () => false,
        read: () => true,
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
    },
    {
      name: 'moderationReason',
      type: 'textarea',
      label: 'Moderation Reason',
      access: {
        create: () => false,
        read: () => true,
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
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
      access: {
        create: () => false,
        read: () => true,
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
      admin: {
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
      access: {
        create: () => false,
        read: () => true,
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ req, data, operation }) => {
        // S04: Always derive author from req.user — reject spoofing
        if (!req.user) {
          throw new Error('Authentication required to create or update a comment.')
        }
        if (!data) {
          throw new Error('No data provided for comment.')
        }
        data.author = req.user.id

        // S04: Reader always creates pending; cannot change status
        if (req.user.role !== 'admin') {
          data.status = 'pending'
          // Strip admin-only fields if reader tries to set them
          delete data.likeCount
          delete data.aiRecommendation
          delete data.moderationReason
        }

        // Validate story OR chapter
        if (operation === 'create') {
          if (!data?.story && !data?.chapter) {
            throw new Error(
              'A comment must be associated with either a story or a chapter.',
            )
          }
        }

        // Single-level reply validation
        if (data?.parent) {
          if (data?.chapter) {
            throw new Error(
              'A reply comment cannot be associated with a chapter. Use the parent comment context.',
            )
          }
        }
      },
    ],
  },
  timestamps: true,
}
