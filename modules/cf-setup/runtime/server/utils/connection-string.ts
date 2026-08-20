// Resolve the Postgres connection string at runtime.
//
// On Cloudflare Workers the DB connection comes exclusively from the
// Hyperdrive binding (env.POSTGRES.connectionString) — there is no
// DATABASE_URL var to read. Hyperdrive injects a credentials-bearing URL
// scoped to the isolate, which is what postgres-js actually dials.

export function resolveConnectionString(): string | undefined {
  const g = globalThis as unknown as {
    __env__?: { POSTGRES?: { connectionString?: string } }
    POSTGRES?: { connectionString?: string }
  }
  const fromBinding = g.__env__?.POSTGRES?.connectionString ?? g.POSTGRES?.connectionString
  if (fromBinding) return fromBinding
  // Dev fallback: `wrangler dev --local` exposes bindings but not Hyperdrive;
  // DATABASE_URL from .dev.vars is the escape hatch.
  return process.env.DATABASE_URL || undefined
}
