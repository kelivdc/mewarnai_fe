// src/server/actions/session.ts
// Server function to resolve the current user from the Better Auth session.
// Called from __root.tsx beforeLoad on every navigation.

import { createServerFn } from '@tanstack/react-start'
import { getCookies } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

export interface SessionUser {
  id: string
  username: string
  name: string
}

/**
 * Reads the Better Auth session and returns the associated user, or null.
 * Uses getCookies() to correctly forward cookies inside a server function.
 */
export const getSessionUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionUser | null> => {
    try {
      const cookies = getCookies()
      const cookieHeader = Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')

      const headers = new Headers()
      headers.set('cookie', cookieHeader)

      const session = await auth.api.getSession({ headers })
      if (!session?.user) return null

      const u = session.user as Record<string, unknown>
      return {
        id: session.user.id,
        username: (u.username as string) ?? session.user.name,
        name: session.user.name,
      }
    } catch {
      return null
    }
  },
)
