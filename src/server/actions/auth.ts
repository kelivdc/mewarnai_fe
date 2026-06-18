// src/server/actions/auth.ts
// TanStack Start server actions for authentication — all session management
// is delegated to Better Auth (email+password + Google OAuth).

import { createServerFn } from '@tanstack/react-start'
import { deleteCookie, getCookies } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

// ---------------------------------------------------------------------------
// Helper: build Headers with cookie string from current request cookies
// ---------------------------------------------------------------------------

function buildCookieHeaders(): Headers {
  const cookies = getCookies()
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
  const headers = new Headers()
  headers.set('cookie', cookieHeader)
  return headers
}

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

interface RegisterInput {
  username: string
  password: string
}

interface LoginInput {
  username: string
  password: string
}

// ---------------------------------------------------------------------------
// registerAction
// ---------------------------------------------------------------------------

export const registerAction = createServerFn({ method: 'POST' })
  .validator((data: RegisterInput) => data)
  .handler(async ({ data }) => {
    try {
      const email = `${data.username.toLowerCase()}@local.app`

      const result = await auth.api.signUpEmail({
        body: {
          email,
          password: data.password,
          name: data.username,
          username: data.username,
          displayUsername: data.username,
        },
        headers: buildCookieHeaders(),
      })

      if (!result?.user) {
        return { success: false as const, error: 'Registration failed' }
      }

      return { success: true as const, userId: result.user.id }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      if (message.toLowerCase().includes('unique') || message.toLowerCase().includes('already')) {
        return { success: false as const, error: 'Username is already taken' }
      }
      return { success: false as const, error: message }
    }
  })

// ---------------------------------------------------------------------------
// loginAction
// ---------------------------------------------------------------------------

export const loginAction = createServerFn({ method: 'POST' })
  .validator((data: LoginInput) => data)
  .handler(async ({ data }) => {
    try {
      const email = `${data.username.toLowerCase()}@local.app`

      const result = await auth.api.signInEmail({
        body: { email, password: data.password },
        headers: buildCookieHeaders(),
      })

      if (!result?.user) {
        return { success: false as const, error: 'Invalid credentials' }
      }

      return { success: true as const, userId: result.user.id }
    } catch {
      return { success: false as const, error: 'Incorrect username or password. Please try again.' }
    }
  })

// ---------------------------------------------------------------------------
// logoutAction
// ---------------------------------------------------------------------------

export const logoutAction = createServerFn({ method: 'POST' })
  .handler(async () => {
    try {
      await auth.api.signOut({ headers: buildCookieHeaders() })
    } catch {
      // best-effort
    }

    deleteCookie('better-auth.session_token', { path: '/' })
    deleteCookie('session', { path: '/' })

    return { success: true as const }
  })
