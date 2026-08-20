import { pgTable, text, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import { organization } from './auth'

// Per-org HS256 signing secrets for third-party product SSO (JWT handoff).
//
// 1:N — an org may hold several secrets so rotation is just CRUD: create a new
// one, switch the product to it, disable the old one (re-enable if something
// breaks), delete once confident. Verification tries every enabled secret, so
// the customer never sends a `kid`. Logical cap of 5 per org enforced in the API.
//
// `secret` is stored in PLAINTEXT: HMAC verification needs the raw value and the
// dashboard re-reveals it on demand (unlike a hashed, show-once bearer key).
// Treat it as a high-value credential at the DB / access-control layer.
export const organizationSso = pgTable('organization_sso', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  orgId: text('org_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  secret: text('secret').notNull(),
  label: text('label'),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('idx_organization_sso_org').on(t.orgId),
])

export const organizationSsoRelations = relations(organizationSso, ({ one }) => ({
  organization: one(organization, { fields: [organizationSso.orgId], references: [organization.id] }),
}))
