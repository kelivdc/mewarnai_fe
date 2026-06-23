// src/lib/authGuard.ts
// Shared beforeLoad utility that enforces authentication on protected routes.
// Requirements: 2.6

import { redirect } from '@tanstack/react-router'
import type { MyRouterContext } from '../routes/__root'
import { getSessionUser } from '../server/actions/session'

/**
 * Call this inside a route's `beforeLoad` to require an authenticated user.
 *
 * Strategy:
 *  1. Check context.user (populated by root beforeLoad server-side).
 *  2. If null, try a fresh server-side read (works during SSR).
 *  3. If still null, redirect to /login.
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
  if (context.user) return

  const user = await getSessionUser()
  if (user) {
    context.user = user
    return
  }

  throw redirect({
    to: '/login',
    search: { redirect: location.href },
  })
}
