import { and, eq } from 'drizzle-orm'
import { organizationSso } from '#layers/feedlog/server/db/schemas'

// DELETE /api/developer/sso/secrets/:id — permanently delete (owner-only).
// Tokens signed with it stop verifying immediately. Org-scoped → 404 for ids
// that don't belong to the caller's org.
export default defineEventHandler(async (event) => {
  const { orgId } = await requireOrgOwner(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 404, message: 'Secret not found' })

  const db = useDB()
  const [row] = await db
    .delete(organizationSso)
    .where(and(eq(organizationSso.id, id), eq(organizationSso.orgId, orgId)))
    .returning({ id: organizationSso.id })
  if (!row) throw createError({ statusCode: 404, message: 'Secret not found' })
  return { ok: true }
})
