import type { CollectionConfig } from 'payload'

export const Stories: CollectionConfig = {
  slug: 'stories',
  labels: {
    singular: 'Story',
    plural: 'Stories',
  },
  access: {
    create: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      return {
        contentStatus: {
          equals: 'published',
        },
      }
    },
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  admin: {
    useAsTitle: 'titleAr',
    defaultColumns: ['titleAr', 'titleZh', 'contentStatus', 'demoOnly', 'updatedAt'],
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
              name: 'synopsisAr',
              type: 'richText',
              label: 'Arabic Synopsis',
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
              name: 'synopsisZh',
              type: 'richText',
              label: 'Chinese Synopsis',
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
              name: 'tags',
              type: 'array',
              label: 'Tags',
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                },
              ],
            },
            {
              name: 'authorName',
              type: 'text',
              label: 'Author Name',
            },
            {
              name: 'genre',
              type: 'text',
              label: 'Genre',
              admin: {
                description: 'e.g., فانتازيا, رعب, خيال علمي, رومانسي, تاريخي',
              },
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Cover Image',
            },
            {
              name: 'totalChapters',
              type: 'number',
              label: 'Total Chapters',
              min: 0,
              access: {
                update: ({ req: { user } }) => Boolean(user),
              },
              admin: {
                description: 'Admin-only field for tracking total chapters',
              },
            },
          ],
        },
        // ---- Status & Rights tab ----
        {
          label: 'Status & Rights',
          fields: [
            {
              name: 'contentStatus',
              type: 'select',
              defaultValue: 'draft',
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
              ],
              label: 'Content Status',
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
                description: 'Mark this story as demo data, not for production use',
              },
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
      ],
    },
  ],
  timestamps: true,
}
