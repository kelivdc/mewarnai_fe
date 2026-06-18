// src/server/actions/resolve-user.ts
// Shared helper to resolve the current userId from the Better Auth session.

import { getCookies } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

/**
 * Resolves the current user's ID from the Better Auth session cookie.
 * Returns the userId string if authenticated, or null if not.
 *
 * Uses getCookies() to build a proper Cookie header that Better Auth
 * can parse — this works correctly inside TanStack Start server functions.
 */
export async function resolveUserId(): Promise<string | null> {
  try {
    const cookies = getCookies()
    const cookieHeader = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')

    const headers = new Headers()
    headers.set('cookie', cookieHeader)

    const session = await auth.api.getSession({ headers })
    return session?.user?.id ?? null
  } catch {
    return null
  }
}
