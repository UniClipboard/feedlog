import { eq } from 'drizzle-orm'
import { organizationSso } from '#layers/feedlog/server/db/schemas'
import { SSO_SECRET_LIMIT } from '#layers/feedlog/shared/constants/sso'

// POST /api/developer/sso/secrets — create a new signing secret (owner-only).
// Body: { label? }. Enforces the per-org cap.
export default defineEventHandler(async (event) => {
  const { orgId } = await requireOrgOwner(event)
  const body = await readBody<{ label?: string }>(event).catch(() => ({} as { label?: string }))
  const db = useDB()

  const existing = await db.$count(organizationSso, eq(organizationSso.orgId, orgId))
  if (existing >= SSO_SECRET_LIMIT) {
    throw createError({ statusCode: 409, message: `Limit of ${SSO_SECRET_LIMIT} secrets reached` })
  }

  const label = typeof body?.label === 'string' && body.label.trim()
    ? body.label.trim().slice(0, 80)
    : null
  const [row] = await db
    .insert(organizationSso)
    .values({ orgId, secret: generateSsoSecret(), label, enabled: true })
    .returning()
  setResponseStatus(event, 201)
  return ssoSecretToView(row!)
})
