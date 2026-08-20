import { desc, eq } from 'drizzle-orm'
import { organizationSso } from '#layers/feedlog/server/db/schemas'

// GET /api/developer/sso/secrets — list this org's signing secrets (owner-only).
// Secrets are returned in full: they're stored plaintext and re-revealable, so
// the dashboard can show them again (unlike a hashed, show-once bearer key).
export default defineEventHandler(async (event) => {
  const { orgId } = await requireOrgOwner(event)
  const db = useDB()
  const rows = await db
    .select()
    .from(organizationSso)
    .where(eq(organizationSso.orgId, orgId))
    .orderBy(desc(organizationSso.createdAt))
  return rows.map(ssoSecretToView)
})
