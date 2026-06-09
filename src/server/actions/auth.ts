// src/server/actions/auth.ts
// TanStack Start server actions for authentication
// Requirements: 1.2, 2.2, 2.4

import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'

import { registerUser, loginUser, invalidateSession } from '../auth'

// ---------------------------------------------------------------------------
// Cookie configuration
// ---------------------------------------------------------------------------

const COOKIE_NAME = 'session'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: COOKIE_MAX_AGE,
  path: '/',
}

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

interface AuthInput {
  username: string
  password: string
}

// ---------------------------------------------------------------------------
// registerAction
// Validates + creates a new user account, then sets the session cookie.
// Requirements: 1.2
// ---------------------------------------------------------------------------

export const registerAction = createServerFn({ method: 'POST' })
  .validator((data: AuthInput) => data)
  .handler(async ({ data }) => {
    const result = await registerUser(data.username, data.password)

    if (!result.success || !result.token) {
      return { success: false as const, error: result.error ?? 'Registration failed' }
    }

    setCookie(COOKIE_NAME, result.token, cookieOptions)

    return { success: true as const, userId: result.userId }
  })

// ---------------------------------------------------------------------------
// loginAction
// Authenticates an existing user and sets the session cookie on success.
// Requirements: 2.2
// ---------------------------------------------------------------------------

export const loginAction = createServerFn({ method: 'POST' })
  .validator((data: AuthInput) => data)
  .handler(async ({ data }) => {
    const result = await loginUser(data.username, data.password)

    if (!result.success || !result.token) {
      return { success: false as const, error: result.error ?? 'Login failed' }
    }

    setCookie(COOKIE_NAME, result.token, cookieOptions)

    return { success: true as const, userId: result.userId }
  })

// ---------------------------------------------------------------------------
// logoutAction
// Reads the session cookie, invalidates the session in the DB, clears cookie.
// Requirements: 2.4
// ---------------------------------------------------------------------------

export const logoutAction = createServerFn({ method: 'POST' })
  .handler(async () => {
    const token = getCookie(COOKIE_NAME)

    if (token) {
      await invalidateSession(token)
    }

    deleteCookie(COOKIE_NAME, { path: '/' })

    return { success: true as const }
  })
