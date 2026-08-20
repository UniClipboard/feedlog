import { consola } from 'consola'
import { resolve } from 'path'

const logger = consola.withTag('migrate')

export default defineNitroPlugin(async () => {
  if (import.meta.preset === 'node-server') {
    logger.info('Starting database migration...')

    const { migrate } = await import('drizzle-orm/postgres-js/migrator')
    const { db } = await import('#layers/feedlog/server/db')
    const { sql } = await import('drizzle-orm')

    const migrationsFolder = resolve(process.env.MIGRATIONS_DIR || 'server/db/migrations')
    logger.info(`Migrations folder: ${migrationsFolder}`)

    await db.execute(sql`SELECT pg_advisory_lock(42)`)
    try {
      await migrate(db, { migrationsFolder })
      logger.success('Database migration completed')
    } catch (error) {
      logger.error('Database migration failed:', error)
      throw error
    } finally {
      await db.execute(sql`SELECT pg_advisory_unlock(42)`)
    }
  }
})
