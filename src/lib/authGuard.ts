// src/lib/authGuard.ts
// Shared beforeLoad utility that enforces authentication on protected routes.
// Requirements: 2.6

import { redirect } from '@tanstack/react-router'
import type { MyRouterContext } from '../routes/__root'

/**
 * Call this inside a route's `beforeLoad` to require an authenticated user.
 * If `context.user` is null (no active session), throws a redirect to `/login`
 * with the current URL preserved in the `redirect` search param so the user
 * is returned to their intended destination after logging in.
 *
 * Usage:
 *   beforeLoad: ({ context, location }) => requireAuth({ context, location })
 */
export function requireAuth({
  context,
  location,
}: {
  context: MyRouterContext
  location: { href: string }
}): void {
  if (!context.user) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    })
  }
}
