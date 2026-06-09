// src/server/db/client.ts
// Drizzle ORM PostgreSQL singleton client
// Uses `pg` Pool + `drizzle-orm/node-postgres` as specified in Requirements 1.2, 3.6, 6.2

import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Singleton Pool — reused across all server function invocations in the same
// Node.js process. This avoids exhausting database connections on every request.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Drizzle client bound to the schema for type-safe queries
export const db = drizzle(pool, { schema })

// Export the raw pool so other modules can run raw SQL if needed (e.g. migrations)
export { pool }
