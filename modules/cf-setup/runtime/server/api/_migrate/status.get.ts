import { probeDatabaseState, setCachedState } from '../../utils/migration-state'
import { resolveConnectionString } from '../../utils/connection-string'

function isCloudflare(): boolean {
  const p = import.meta.preset
  return p === 'cloudflare-module' || p === 'cloudflare-pages'
}

export default defineEventHandler(async () => {
  if (!isCloudflare()) throw createError({ statusCode: 404 })
  // Always probe live — never serve from cache. Status is the one endpoint
  // that must reflect reality after a manual DB fiddle or a concurrent run.
  const snapshot = await probeDatabaseState(resolveConnectionString())
  setCachedState(snapshot)
  return snapshot
})
