import type { Access } from 'payload'

/**
 * Access control: admin users can access all documents;
 * otherwise only allow if the document's `user` field equals the current user's ID.
 *
 * In this V1 starter, all authenticated users of the auth collection are admin-level.
 * When a role field is added later, uncomment the admin role check below.
 */
export const ownerOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false

  // Admin check — in V1, all authenticated auth-collection users are admin.
  // TODO: when roles are implemented, replace with: if (user.role === 'admin') return true
  return {
    user: {
      equals: user.id,
    },
  }
}
