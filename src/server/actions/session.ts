// src/server/actions/session.ts
// Server function to resolve the current user from the session cookie.
// Kept in a separate .ts file so @tanstack/react-start/server is never
// imported in client-side code (satisfies TanStack Start import-protection).

import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'

import { db } from '../db/client'
import { users } from '../db/schema'
import { validateSession } from '../auth'

export interface SessionUser {
  id: string
  username: string
  name: string
}

/**
 * Reads the session cookie and returns the associated user, or null if the
 * session is missing/expired.  Called from __root.tsx beforeLoad so every
 * navigation knows who (if anyone) is logged in.
 */
export const getSessionUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionUser | null> => {
    const token = getCookie('session')
    if (!token) return null

    const userId = await validateSession(token)
    if (!userId) return null

    const [user] = await db
      .select({ id: users.id, username: users.username, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) return null

    return {
      id: user.id,
      username: user.username ?? user.name,
      name: user.name,
    }
  },
)
