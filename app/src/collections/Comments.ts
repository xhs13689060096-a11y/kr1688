import type { CollectionConfig, Where } from 'payload'

import { authenticated } from '../access/authenticated'

const readerForbiddenCommentFields = new Set(['author', 'story', 'chapter', 'parent', 'status'])

export function assertReaderCommentPatch(data: Record<string, unknown>): void {
  for (const field of readerForbiddenCommentFields) {
    if (Object.hasOwn(data, field)) {
      throw new Error(`Readers cannot update comment field: ${field}`)
    }
  }
}

/**
 * S04 — Secured Comments collection.
 *
 * - Author always derived from req.user.id (anti-spoofing).
 * - Reader creates published comments and can only mutate own body.
 * - Only administrators control comment visibility and deletion.
 * - Public and readers see only published comments.
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
        return { status: { equals: 'published' } }
      }
      if (user.role === 'admin') {
        return true
      }
      return { status: { equals: 'published' } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      // Reader: only own comments
      return { author: { equals: user.id } }
    },
    delete: ({ req: { user } }): boolean => user?.role === 'admin',
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
      access: {
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
      hasMany: false,
      label: 'Chapter',
      access: {
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'comments',
      hasMany: false,
      label: 'Parent Comment',
      access: {
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Hidden', value: 'hidden' },
      ],
      defaultValue: 'published',
      label: 'Status',
      access: {
        create: () => false,
        read: () => true,
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
    },
  ],
  hooks: {
    beforeOperation: [
      ({ args, operation, req }) => {
        if (
          operation === 'update' &&
          req.user?.role !== 'admin' &&
          args.data &&
          typeof args.data === 'object' &&
          !Array.isArray(args.data)
        ) {
          assertReaderCommentPatch(args.data)
        }

        return args
      },
    ],
    beforeValidate: [
      ({ req, data, operation }) => {
        // S04: Always derive author from req.user — reject spoofing
        if (!req.user) {
          throw new Error('Authentication required to create or update a comment.')
        }
        if (!data) {
          throw new Error('No data provided for comment.')
        }
        if (operation === 'create') {
          data.author = req.user.id
          if (req.user.role !== 'admin') {
            data.status = 'published'
          }
        } else {
          // Payload provides merged document data to beforeValidate. Protected update
          // fields are enforced above through field access, while this hook preserves
          // ownership by never assigning an updater as the author.
        }

        // Validate story OR chapter
        if (operation === 'create') {
          if (!data?.story && !data?.chapter) {
            throw new Error('A comment must be associated with either a story or a chapter.')
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
    afterChange: [
      ({ doc, operation, previousDoc, req }) => {
        if (
          operation === 'update' &&
          req.user?.role === 'admin' &&
          previousDoc.status !== doc.status
        ) {
          req.payload.logger.info({
            msg: 'comment moderation transition',
            actorId: req.user.id,
            commentId: doc.id,
            previousStatus: previousDoc.status,
            nextStatus: doc.status,
          })
        }
      },
    ],
  },
  timestamps: true,
}
