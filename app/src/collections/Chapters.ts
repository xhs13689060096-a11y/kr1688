import type { CollectionConfig, Where } from 'payload'

const publicChapterReadWhere: Where = {
  and: [
    {
      status: {
        equals: 'published',
      },
    },
    {
      'story.contentStatus': {
        equals: 'published',
      },
    },
  ],
}

export const Chapters: CollectionConfig = {
  slug: 'chapters',
  labels: {
    singular: 'Chapter',
    plural: 'Chapters',
  },
  access: {
    create: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      return publicChapterReadWhere
    },
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  admin: {
    useAsTitle: 'titleAr',
    defaultColumns: ['titleAr', 'chapterNumber', 'story', 'status', 'demoOnly', 'updatedAt'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ---- Arabic tab ----
        {
          label: 'Arabic (عربي)',
          fields: [
            {
              name: 'titleAr',
              type: 'text',
              required: true,
              label: 'Arabic Title',
            },
            {
              name: 'bodyAr',
              type: 'richText',
              label: 'Arabic Chapter Body',
            },
          ],
        },
        // ---- Chinese tab ----
        {
          label: 'Chinese (中文)',
          fields: [
            {
              name: 'titleZh',
              type: 'text',
              label: 'Chinese Title',
            },
            {
              name: 'bodyZh',
              type: 'richText',
              label: 'Chinese Chapter Body',
            },
          ],
        },
        // ---- Content & Metadata tab ----
        {
          label: 'Content & Metadata',
          fields: [
            {
              name: 'slug',
              type: 'text',
              unique: true,
              admin: {
                position: 'sidebar',
              },
              hooks: {
                beforeValidate: [
                  ({ data }) => {
                    if (data?.titleAr && !data?.slug) {
                      data.slug = data.titleAr
                        .toLowerCase()
                        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-')
                    }
                  },
                ],
              },
              label: 'Slug',
            },
            {
              name: 'chapterNumber',
              type: 'number',
              required: true,
              min: 1,
              admin: {
                position: 'sidebar',
              },
              label: 'Chapter Number',
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
              name: 'wordCount',
              type: 'number',
              min: 0,
              admin: {
                position: 'sidebar',
              },
              label: 'Word Count',
            },
          ],
        },
        // ---- Status & Publish tab ----
        {
          label: 'Status & Publish',
          fields: [
            {
              name: 'status',
              type: 'select',
              defaultValue: 'draft',
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
              ],
              label: 'Status',
            },
            {
              name: 'publishedAt',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
              label: 'Published At',
            },
          ],
        },
        // ---- Demo tab ----
        {
          label: 'Demo',
          fields: [
            {
              name: 'demoOnly',
              type: 'checkbox',
              defaultValue: false,
              label: 'Demo Only',
              admin: {
                description: 'Mark this chapter as demo data, not for production use',
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
