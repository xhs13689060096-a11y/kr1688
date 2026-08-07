import type { Access } from 'payload'

/**
 * Access control: admin users can access all documents;
 * otherwise only allow if the document's `user` field equals the current user's ID.
 */
export const ownerOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false

  if (user.role === 'admin') return true

  return {
    user: {
      equals: user.id,
    },
  }
}
