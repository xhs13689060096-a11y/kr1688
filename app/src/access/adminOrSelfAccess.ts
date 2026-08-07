import type { Access } from 'payload'

/**
 * Admin users can access all documents.
 * Non-admin (reader) users can only access their own documents
 * (where document.id equals user.id) or read-only filtered by user field.
 */
export const adminOrSelfAccess: Access = ({ req: { user } }) => {
  if (!user) return false

  if (user.role === 'admin') return true

  return {
    id: {
      equals: user.id,
    },
  }
}
