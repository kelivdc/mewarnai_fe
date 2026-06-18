// src/lib/authGuard.ts
// Shared beforeLoad utility that enforces authentication on protected routes.
// Requirements: 2.6

import { redirect } from '@tanstack/react-router'
import type { MyRouterContext } from '../routes/__root'
import { authClient } from './auth-client'

/**
 * Call this inside a route's `beforeLoad` to require an authenticated user.
 *
 * Strategy:
 *  1. Check context.user (set by root beforeLoad on SSR / initial load).
 *  2. If null, ask Better Auth client directly — this carries browser cookies
 *     automatically and works reliably on client-side navigation.
 *  3. Only redirect to /login if both checks fail.
 *
 * Usage:
 *   beforeLoad: async ({ context, location }) => requireAuth({ context, location })
 */
export async function requireAuth({
  context,
  location,
}: {
  context: MyRouterContext
  location: { href: string }
}): Promise<void> {
  // Fast path: root beforeLoad already resolved a user
  if (context.user) return

  // Client-side check: ask Better Auth directly (cookies sent automatically)
  const { data: session } = await authClient.getSession()
  if (session?.user) {
    const u = session.user as Record<string, unknown>
    context.user = {
      id: session.user.id,
      username: (u.username as string) ?? session.user.name,
      name: session.user.name,
    }
    return
  }

  throw redirect({
    to: '/login',
    search: { redirect: location.href },
  })
}
