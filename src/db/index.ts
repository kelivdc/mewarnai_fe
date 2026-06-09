// src/db/index.ts
// Re-export the canonical DB singleton from the server layer.
// This keeps import paths short throughout the app: import { db } from '#/db'
export { db, pool } from '../server/db/client'
