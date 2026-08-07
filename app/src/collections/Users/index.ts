import type { CollectionConfig } from 'payload'

import { adminOrSelfAccess } from '../../access/adminOrSelfAccess'
import { anyone } from '../../access/anyone'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    create: anyone,
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    read: adminOrSelfAccess,
    update: adminOrSelfAccess,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: {
    verify: false,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Reader', value: 'reader' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'reader',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ req, data, operation }) => {
        if (!data) return
        // Public registration always creates reader role
        // Only admin can assign admin role
        if (operation === 'create' && (!req.user || req.user.role !== 'admin')) {
          data.role = 'reader'
        }
        if (operation === 'update' && req.user?.role !== 'admin') {
          // Non-admin can only update their own non-role fields
          if (data.role && data.role !== 'reader') {
            data.role = 'reader'
          }
        }
      },
    ],
  },
  timestamps: true,
  versions: false,
}
